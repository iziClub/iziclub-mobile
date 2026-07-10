import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker'; // 💡 Nécessaire pour sélectionner le fichier

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
  getUploadUrl // 💡 Ton nouveau service
} from "@/services/forms.service";

type Props = {
  club: any;
  isLoggedIn: boolean;
  user: any;
};

export default function MembershipSection({ club, isLoggedIn, user }: Props) {
  const [currentForm, setCurrentForm] = useState<DynamicForm | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Stockage du submissionId pour éviter de recréer un brouillon à chaque upload/sauvegarde
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null); // Loader individuel pour l'upload

  useEffect(() => {
    const fetchForm = async () => {
      if (!isLoggedIn || !club?.id) return;
      setLoading(true);
      try {
        const response = await getClubForm(club.id);
        const formData = response?.data || response;
        if (formData && formData.questions) {
          setCurrentForm(formData);
        } else {
          setCurrentForm(null);
        }
      } catch (error) {
        console.error("Erreur récupération formulaire:", error);
        Alert.alert("Erreur", "Impossible de charger le formulaire.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [club?.id, isLoggedIn]);

  if (!isLoggedIn) return <LoginRequired />;

  // ─────────────────────────────────────────────────────────
  // 💡 LOGIQUE D'UPLOAD S3 VIA PRE-SIGNED URL
  // ─────────────────────────────────────────────────────────
  const handleDocumentUpload = async (questionId: string) => {
    try {
      // 1. Sélection du fichier sur l'appareil
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      const contentType = file.mimeType || "application/pdf";

      setUploadingQuestionId(questionId);

      // 2. Récupérer ou créer un ID de soumission (Draft)
      let submissionId = activeSubmissionId;
      if (!submissionId && currentForm) {
        const draftResponse = await createDraftSubmission(currentForm.id);
        submissionId = draftResponse?.data?.id || draftResponse?.id;
        if (submissionId) setActiveSubmissionId(submissionId);
      }

      if (!submissionId) {
        throw new Error("Impossible d'initialiser la soumission pour l'upload.");
      }

      // 3. Demander l'URL pré-signée à l'API
      const urlResponse = await getUploadUrl(submissionId, contentType);
      const { uploadUrl, filePath } = urlResponse?.data.data;
      const fileToUpload = {
        uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
        type: contentType,
        name: file.name || `document_${questionId}.pdf`,
      };

      // 5. Upload binaire direct sur S3
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        body: fileToUpload as any, // Cast en 'any' car le typage standard attend un Blob
        headers: {
          "Content-Type": contentType,
        },
      });

      if (!s3Response.ok) {
        const errorText = await s3Response.text();
        console.error("Réponse S3 invalide :", errorText);
        throw new Error("Le dépôt du fichier sur le serveur S3 a échoué.");
      }

      // 6. Succès : On stocke le filePath
      setFormResponses((prev) => ({ ...prev, [questionId]: filePath, fileName: file.name }));
      Alert.alert("Succès", `Le fichier "${file.name}" a été téléversé.`);

    } catch (error: any) {
      console.error("Erreur lors de l'upload du document :", error);
      Alert.alert("Échec de l'envoi", "Impossible de téléverser le document. Veuillez réessayer.");
    } finally {
      setUploadingQuestionId(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Handlers standards
  // ─────────────────────────────────────────────────────────
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

    // Si aucun upload n'a créé de brouillon avant, on le crée ici
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
    // 💡 Si c'est un objet document, on vérifie s'il a un filePath
    const hasValue = response && typeof response === "object" ? !!response.filePath : !!response;
    
    if (!hasValue || (Array.isArray(response) && response.length === 0)) {
      Alert.alert("Champ obligatoire", `Le champ "${question.name}" doit être renseigné.`);
      return;
    }
  }
}

    setIsSubmitting(true);
    try {
      const submissionId = await executeDraftWorkflow();
      await submitFormSubmission(submissionId);
      Alert.alert("Félicitations !", "Votre dossier complet a été envoyé avec succès au club.");
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

      {currentForm.questions.map((question) => {
  // 💡 Si c'est un document, on extrait le nom lisible pour l'affichage, sinon la valeur brute
  const responseValue = formResponses[question.id];
  const displayValue = responseValue && typeof responseValue === "object" && "fileName" in responseValue
    ? responseValue.fileName 
    : responseValue;

  return (
    <QuestionCard
      key={question.id}
      question={question}
      value={displayValue} // 💡 Reçoit désormais "mon_cv.pdf" au lieu de "form-submissions/..."
      onTextChange={(value) => handleTextChange(question.id, value)}
      onRadioChange={(label) => handleRadioSelect(question.id, label)}
      onCheckboxChange={(label) => handleCheckboxSelect(question.id, label)}
      onDocumentUpload={() => handleDocumentUpload(question.id)}
    />
  );
})}

      {/* Reste des boutons (Draft & Envoi) */}
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
          style={[styles.submitButton, (isSubmitting || isSavingDraft || !!uploadingQuestionId) && { opacity: 0.7 }]}
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