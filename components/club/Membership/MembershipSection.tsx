import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker'; 
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import MembershipHeader from "./MembershipHeader";
import ProfileCard from "./ProfileCard";
import QuestionCard from "./QuestionCard";
import LoginRequired from "./LoginRequired";

import { DynamicForm } from "./types";
import { styles } from "./styles";

import { getClubForm } from "@/services/clubs.service";
import {
  createDraftSubmission,
  addAnswersToSubmission,
  submitFormSubmission,
  getUploadUrl,
  getAllSubmissions,
} from "@/services/forms.service";

type Props = {
  club: any;
  isLoggedIn: boolean;
  user: any;
};

export default function MembershipSection({ club, isLoggedIn, user }: Props) {
  const router = useRouter();
  const [currentForm, setCurrentForm] = useState<DynamicForm | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean>(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null); 
  const [hasResumedDraft, setHasResumedDraft] = useState<boolean>(false);

  // Transforme les réponses brutes de l'API (answers[]) en dictionnaire questionId -> valeur
  const parseAnswersFromApi = (rawAnswers: any[] = []) => {
    const parsed: Record<string, any> = {};
    (rawAnswers || []).forEach((answer: any) => {
      if (!answer) return;
      const value = answer.value;
      if (typeof value === "string" && value.includes(", ")) {
        parsed[answer.questionId] = value.split(", ");
      } else {
        parsed[answer.questionId] = value;
      }
    });
    return parsed;
  };

  // Recherche un brouillon existant pour ce formulaire afin d'éviter à l'utilisateur de tout ressaisir
  const checkForExistingDraft = async (formId: string) => {
    try {
      const response = await getAllSubmissions();
      const submissions = response?.data?.submissions || response?.submissions || [];
      const draft = submissions.find(
        (submission: any) => submission.formId === formId && submission.status === "draft"
      );
      if (draft) {
        setActiveSubmissionId(draft.id);
        setFormResponses(parseAnswersFromApi(draft.answers));
        setHasResumedDraft(true);
      }
    } catch (error) {
      // L'absence de brouillon ne doit jamais bloquer l'affichage du formulaire
      console.error("Erreur récupération des brouillons existants:", error);
    }
  };

  useEffect(() => {
    const fetchForm = async () => {
      if (!isLoggedIn || !club?.id) return;
      setLoading(true);
      try {
        const response = await getClubForm(club.id);
        const formData = response?.data || response;
        if (formData && formData.questions) {
          setCurrentForm(formData);
          await checkForExistingDraft(formData.id);
        } else {
          setCurrentForm(null);
        }
      } catch (error: any) {
        // Pas de formulaire en ligne pour ce club : cas normal, pas d'alerte
        if (error?.response?.status === 404) {
          setCurrentForm(null);
        } else {
          console.error("Erreur récupération formulaire:", error);
          Alert.alert("Erreur", "Impossible de charger le formulaire.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [club?.id, isLoggedIn]);

  if (!isLoggedIn) return <LoginRequired />;

  const handleRestartFromScratch = () => {
    setFormResponses({});
    setHasAgreedToTerms(false);
    setHasResumedDraft(false);
  };


  // ─────────────────────────────────────────────────────────
  // 💡 LOGIQUE D'UPLOAD S3 VIA PRE-SIGNED URL
  // ─────────────────────────────────────────────────────────
  const handleDocumentUpload = async (questionId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      const contentType = file.mimeType || "application/pdf";

      setUploadingQuestionId(questionId);

      let submissionId = activeSubmissionId;
      if (!submissionId && currentForm) {
        const draftResponse = await createDraftSubmission(currentForm.id);
        submissionId = draftResponse?.data?.id || draftResponse?.id;
        if (submissionId) setActiveSubmissionId(submissionId);
      }

      if (!submissionId) {
        throw new Error("Impossible d'initialiser la soumission pour l'upload.");
      }

      const urlResponse = await getUploadUrl(submissionId, contentType);
      const { uploadUrl, filePath } = urlResponse?.data.data;
      const localUri = file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`;

      // Upload direct du binaire local vers l'URL pré-signée S3 (fetch n'accepte plus
      // {uri, type, name} comme BodyInit sur cette version de React Native)
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, localUri, {
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          "Content-Type": contentType,
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        console.error("Réponse S3 invalide :", uploadResult.body);
        throw new Error("Le dépôt du fichier sur le serveur S3 a échoué.");
      }

      // 💡 On garde la logique de stockage intacte pour ne rien casser en BDD/API
      setFormResponses((prev) => ({ ...prev, [questionId]: filePath, fileName: file.name }));
      Alert.alert("Succès", `Le fichier "${file.name}" a été téléversé.`);

    } catch (error: any) {
      console.error("Erreur lors de l'upload du document :", error);
      Alert.alert("Échec de l'envoi", "Impossible de téléverser le document. Veuillez réessayer.");
    } finally {
      setUploadingQuestionId(null);
    }
  };

  const handleTextChange = (questionId: string, value: string) => {
    setFormResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleRadioSelect = (questionId: string, optionLabel: string) => {
    setFormResponses((prev) => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleCheckboxSelect = (questionId: string, optionLabel: string) => {
    const currentAnswers = formResponses[questionId] || [];
    const updatedAnswers = currentAnswers.includes(optionLabel)
      ? currentAnswers.filter((label: string) => label !== optionLabel)
      : [...currentAnswers, optionLabel];
    setFormResponses((prev) => ({ ...prev, [questionId]: updatedAnswers }));
  };

  const formatAnswersForApi = () => {
    return Object.entries(formResponses).map(([questionId, value]) => {
      let formattedValue = value;
      if (Array.isArray(value)) {
        formattedValue = value.join(", ");
      } else if (value && typeof value === "object" && "filePath" in value) {
        formattedValue = value.filePath;
      }
      return {
        questionId,
        value: String(formattedValue),
      };
    });
  };

  const executeDraftWorkflow = async () => {
    let submissionId = activeSubmissionId;

    if (!submissionId && currentForm) {
      const draftResponse = await createDraftSubmission(currentForm.id);
      submissionId = draftResponse?.data?.id || draftResponse?.id;
      if (submissionId) setActiveSubmissionId(submissionId);
    }

    if (!submissionId) {
      throw new Error("Impossible de récupérer l'identifiant de soumission.");
    }

    const formattedAnswers = formatAnswersForApi();
    if (formattedAnswers.length > 0) {
      await addAnswersToSubmission(submissionId, { answers: formattedAnswers });
    }

    return submissionId;
  };

  const handleDraftSave = async () => {
    setIsSavingDraft(true);
    try {
      await executeDraftWorkflow();
      Alert.alert("Brouillon sauvegardé", "Vos modifications ont bien été enregistrées.");
    } catch (error: any) {
      console.error("Erreur brouillon :", error);
      Alert.alert("Erreur", "Impossible de sauvegarder votre brouillon.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentForm) return;

    for (const question of currentForm.questions) {
      if (question.required) {
        const response = formResponses[question.id];
        const hasValue = response && typeof response === "object" ? !!response.filePath : !!response;
        
        if (!hasValue || (Array.isArray(response) && response.length === 0)) {
          Alert.alert("Champ obligatoire", `Le champ "${question.name}" doit être renseigné.`);
          return;
        }
      }
    }

    if (!hasAgreedToTerms) {
      Alert.alert(
        "Engagement obligatoire", 
        "Vous devez certifier l'exactitude des informations et accepter le caractère officiel de cette demande pour envoyer votre dossier."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionId = await executeDraftWorkflow();
      await submitFormSubmission(submissionId);
      Alert.alert(
        "Félicitations !",
        "Votre dossier complet a été envoyé avec succès au club. Tu peux suivre son avancement à tout moment depuis tes inscriptions.",
        [{ text: "Voir mon dossier", onPress: () => router.replace("/profile/inscriptions") }]
      );
    } catch (error) {
      console.error("Erreur soumission finale :", error);
      Alert.alert("Erreur lors de l'envoi", "Une erreur est survenue pendant la finalisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
        <ActivityIndicator size="large" color="#4A78FF" />
        <Text style={{ marginTop: 12, color: "#666" }}>Chargement du formulaire...</Text>
      </View>
    );
  }

  if (!currentForm) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A1A1A", textAlign: "center" }}>
          Aucun formulaire d'inscription disponible
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <MembershipHeader form={currentForm} />
      <ProfileCard user={user} />

      {hasResumedDraft && (
        <View
          style={{
            backgroundColor: "#F0F4FF",
            borderWidth: 1,
            borderColor: "#D6E0FF",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Ionicons name="document-text" size={20} color="#4A78FF" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", color: "#1A1A1A", marginBottom: 2 }}>
              Brouillon retrouvé
            </Text>
            <Text style={{ fontSize: 13, color: "#4A5568", lineHeight: 18 }}>
              Tu avais déjà commencé ce dossier, on a préremplis tes réponses. Tu peux continuer ou repartir de zéro.
            </Text>
            <TouchableOpacity onPress={handleRestartFromScratch} style={{ marginTop: 8 }}>
              <Text style={{ color: "#4A78FF", fontWeight: "600", fontSize: 13 }}>
                Repartir de zéro
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentForm.questions.map((question) => {
        const responseValue = formResponses[question.id];
        
        // 💡 MODIFICATION ICI : On détecte si c'est un fichier ou un chemin S3 
        // pour renvoyer une phrase claire au lieu du nom technique du fichier.
        let displayValue = responseValue;
        
        if (responseValue) {
          // Si c'est l'objet issu de ton upload direct OU si c'est une chaîne qui contient un chemin d'upload
          if (
            (typeof responseValue === "object" && "filePath" in responseValue) || 
            (typeof responseValue === "string" && responseValue.includes("form-submissions/"))
          ) {
            displayValue = "Document ajouté"; 
          }
        }

        return (
          <QuestionCard
            key={question.id}
            question={question}
            value={displayValue} // 💡 Reçoit maintenant "✅ Document ajouté" si un fichier existe
            onTextChange={(value) => handleTextChange(question.id, value)}
            onRadioChange={(label) => handleRadioSelect(question.id, label)}
            onCheckboxChange={(label) => handleCheckboxSelect(question.id, label)}
            onDocumentUpload={() => handleDocumentUpload(question.id)}
          />
        );
      })}

      {/* Encadré engagement légal */}
      <View style={{
        backgroundColor: '#FFF9F3', 
        borderWidth: 1,
        borderColor: '#FFE2C5',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
      }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
          onPress={() => setHasAgreedToTerms(!hasAgreedToTerms)}
          activeOpacity={0.8}
        >
          <View style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: hasAgreedToTerms ? '#4A78FF' : '#A0AEC0',
            backgroundColor: hasAgreedToTerms ? '#4A78FF' : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2 
          }}>
            {hasAgreedToTerms && (
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#2D3748', marginBottom: 4 }}>
              Certification & Engagement Officiel
            </Text>
            <Text style={{ fontSize: 13, color: '#4A5568', lineHeight: 18 }}>
              Je certifie sur l'honneur l'exactitude des informations fournies. Je comprends que la soumission de ce formulaire constitue un <Text style={{ fontWeight: '700' }}>engagement réel et officiel</Text> auprès du club, et valide mon adhésion sous réserve d'acceptation de mon dossier.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Reste des boutons */}
      <View style={{ marginTop: 20, gap: 12 }}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: '#F0F4FF', borderColor: '#4A78FF', borderWidth: 1 }]}
          onPress={handleDraftSave}
          disabled={isSubmitting || isSavingDraft || !!uploadingQuestionId}
        >
          {isSavingDraft ? (
            <ActivityIndicator size="small" color="#4A78FF" />
          ) : (
            <Text style={[styles.submitButtonText, { color: '#4A78FF' }]}>Enregistrer en brouillon</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton, 
            (isSubmitting || isSavingDraft || !!uploadingQuestionId || !hasAgreedToTerms) && { opacity: 0.6 }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isSavingDraft || !!uploadingQuestionId}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Envoyer mon dossier</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}