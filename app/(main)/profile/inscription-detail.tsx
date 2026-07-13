import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { InscriptionStatus } from './inscriptions';
import QuestionCard from "@/components/club/Membership/QuestionCard"; 

import {
  deleteSubmission,
  getFormByFormId,
  addAnswersToSubmission,
  submitFormSubmission,
  getUploadUrl
} from '@/services/forms.service';

export default function InscriptionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const submissionId = params.id as string; 
  const clubName = (params.clubName as string) || "Club Partenaire";
  const status = params.status as InscriptionStatus;
  const date = params.date as string;
  const comment = params.comment as string;
  const formName = params.formName as string;
  const formId = params.formId as string;
  const submittedAt = date ? new Date(date) : null;

  const isDraftMode = status === 'draft';

  // États de données
  const [formStructure, setFormStructure] = useState<any | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [loadingForm, setLoadingForm] = useState<boolean>(true);

  // 💡 NOUVEAU : État pour certifier l'engagement légal
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean>(false);

  // États UX d'action réseau
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormStructure = async () => {
      if (!formId) {
        setLoadingForm(false);
        return;
      }
      try {
        setLoadingForm(true);
        const response = await getFormByFormId(formId);
        const formData = response?.data || response;
        setFormStructure(formData);

        if (params.answers) {
          const rawAnswers = JSON.parse(params.answers as string);
          const localResponses: Record<string, any> = {};
          rawAnswers.forEach((ans: any) => {
            if (ans.value && String(ans.value).startsWith('form-submissions/')) {
              localResponses[ans.questionId] = {
                filePath: ans.value,
                fileName: ans.value.split('/').pop() || "Document existant"
              };
            } else if (String(ans.value).includes(', ')) {
              localResponses[ans.questionId] = ans.value.split(', ');
            } else {
              localResponses[ans.questionId] = ans.value;
            }
          });
          setFormResponses(localResponses);
        }
      } catch (error) {
        console.error("Erreur métadonnées formulaire:", error);
      } finally {
        setLoadingForm(false);
      }
    };

    fetchFormStructure();
  }, [formId, params.answers]);

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

      const urlResponse = await getUploadUrl(submissionId, contentType);
      const { uploadUrl, filePath } = urlResponse?.data?.data || urlResponse?.data || urlResponse;

      const fileToUpload = {
        uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
        type: contentType,
        name: file.name || `document_${questionId}.pdf`,
      };

      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        body: fileToUpload as any,
        headers: { "Content-Type": contentType },
      });

      if (!s3Response.ok) throw new Error("Le dépôt sur S3 a échoué.");

      setFormResponses((prev) => ({
        ...prev,
        [questionId]: { filePath, fileName: file.name }
      }));
      Alert.alert("Succès", `Le fichier "${file.name}" a été téléversé.`);
    } catch (error) {
      console.error("Erreur upload document:", error);
      Alert.alert("Échec de l'envoi", "Impossible de téléverser le document.");
    } finally {
      setUploadingQuestionId(null);
    }
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

  const handleDraftSave = async () => {
    setIsSavingDraft(true);
    try {
      const formattedAnswers = formatAnswersForApi();
      if (formattedAnswers.length > 0) {
        await addAnswersToSubmission(submissionId, { answers: formattedAnswers });
      }
      Alert.alert("Brouillon sauvegardé", "Vos modifications ont bien été enregistrées.");
    } catch (error) {
      console.error("Erreur brouillon :", error);
      Alert.alert("Erreur", "Impossible de sauvegarder votre brouillon.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!formStructure?.questions) return;

    for (const question of formStructure.questions) {
      if (question.required) {
        const response = formResponses[question.id];
        const hasValue = response && typeof response === "object" ? !!response.filePath : !!response;

        if (!hasValue || (Array.isArray(response) && response.length === 0)) {
          Alert.alert("Champ obligatoire", `Le champ "${question.name}" doit être renseigné.`);
          return;
        }
      }
    }

    // 💡 NOUVEAU : Blocage si la case d'engagement officiel n'est pas cochée
    if (!hasAgreedToTerms) {
      Alert.alert(
        "Engagement obligatoire", 
        "Vous devez certifier l'exactitude des informations et accepter le caractère officiel de cette demande pour envoyer votre dossier."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = formatAnswersForApi();
      if (formattedAnswers.length > 0) {
        await addAnswersToSubmission(submissionId, { answers: formattedAnswers });
      }
      await submitFormSubmission(submissionId);
      Alert.alert("Félicitations !", "Votre dossier complet a été envoyé avec succès au club.", [
        { text: "OK", onPress: () => router.replace("/profile/inscriptions") }
      ]);
    } catch (error) {
      console.error("Erreur soumission finale :", error);
      Alert.alert("Erreur lors de l'envoi", "Une erreur est survenue pendant la finalisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInscription = () => {
    Alert.alert(
      "Supprimer la demande",
      "Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteSubmission(submissionId);
              router.replace("/profile/inscriptions");
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert("Erreur", "Impossible de supprimer la demande.");
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (d: Date | null) => {
    if (!d || Number.isNaN(d.getTime())) return 'Date inconnue';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  const formatTime = (d: Date | null) => {
    if (!d || Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(d);
  };

  const getStatusConfig = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return { color: '#10B981', bg: '#E6F4EA', label: 'Dossier Validé', icon: 'verified' };
      case 'rejected': return { color: '#EF4444', bg: '#FCE8E6', label: 'Dossier Refusé', icon: 'cancel' };
      case 'pending_info': return { color: '#F59E0B', bg: '#FEF3C7', label: 'Action requise', icon: 'error' };
      case 'draft': return { color: '#4A78FF', bg: '#F0F4FF', label: 'Brouillon', icon: 'edit' };
      default: return { color: '#3B82F6', bg: '#EBF5FF', label: 'En cours d\'analyse', icon: 'hourglass-top' };
    }
  };

  const config = getStatusConfig(status);

  const getReadableAnswer = (questionId: string, value: any) => {
    if (!formStructure || !formStructure.questions) {
      return { title: "Question", textValue: String(value) };
    }
    const question = formStructure.questions.find((q: any) => q.id === questionId);
    if (!question) return { title: "Question", textValue: String(value) };
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { title: question.name, textValue: "Non renseigné" };
    }
    const textValue = Array.isArray(value) ? value.join(', ') : String(value);
    return { title: question.name, textValue };
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/profile/inscriptions")}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isDraftMode ? "Modifier le brouillon" : "Détail de la demande"}</Text>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteInscription} disabled={isDeleting}>
          {isDeleting ? <ActivityIndicator size="small" color="#EF4444" /> : <Ionicons name="trash-outline" size={20} color="#EF4444" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.formName}>{formName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="business-outline" size={14} color="#737373" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>
              Destinataire : <Text style={{ color: '#171717', fontWeight: '600' }}>{clubName}</Text>
            </Text>
          </View>
        </View>

        {/* BANNIÈRE DE STATUT */}
        <View style={[styles.statusBanner, { backgroundColor: config.bg, borderColor: config.color + '20' }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF' }]}>
            <MaterialIcons name={config.icon as any} size={24} color={config.color} />
          </View>
          <View style={styles.statusBannerText}>
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.statusSubtitle}>
              {isDraftMode ? "Non encore transmis au club" : `Envoyé le ${formatDate(submittedAt)} à ${formatTime(submittedAt)}`}
            </Text>
          </View>
        </View>

        {/* NOTES DU CLUB (Uniquement hors mode brouillon) */}
        {!isDraftMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes de la structure</Text>
            {comment ? (
              <View style={styles.messageBubbleClub}>
                <View style={styles.clubMessageHeader}>
                  <Text style={styles.clubMessageSender}>{clubName}</Text>
                  <Text style={styles.clubMessageTime}>Dernier retour</Text>
                </View>
                <Text style={styles.clubMessageBody}>{comment}</Text>
              </View>
            ) : (
              <View style={styles.emptyMessageContainer}>
                <Ionicons name="chatbox-ellipses-outline" size={24} color="#A3A3A3" />
                <Text style={styles.emptyMessageText}>Aucune remarque ou consigne particulière.</Text>
              </View>
            )}
          </View>
        )}

        {/* CONTENU PRINCIPAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isDraftMode ? "Renseigner vos informations" : "Formulaire transmis"}</Text>

          {loadingForm ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : isDraftMode && formStructure?.questions ? (
            <View style={{ gap: 16 }}>
              {formStructure.questions.map((question: any) => {
                const responseValue = formResponses[question.id];
                
                // 💡 Simplification du nom de fichier si c'est un document (on garde la logique précédente)
                let displayValue = responseValue;
                if (responseValue) {
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
                    value={displayValue}
                    onTextChange={(value) => handleTextChange(question.id, value)}
                    onRadioChange={(label) => handleRadioSelect(question.id, label)}
                    onCheckboxChange={(label) => handleCheckboxSelect(question.id, label)}
                    onDocumentUpload={() => handleDocumentUpload(question.id)}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.responsesCard}>
              {JSON.parse(params.answers as string || '[]').map((ans: any, index: number, arr: any[]) => {
                const mapped = getReadableAnswer(ans.questionId, ans.value);
                return (
                  <View
                    key={ans.questionId}
                    style={[styles.responseRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <Text style={styles.responseQuestion}>{mapped.title}</Text>
                    <Text style={styles.responseValue}>{mapped.textValue}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 💡 NOUVEAU : ENCADRÉ D'ENGAGEMENT LÉGAL (MODE DRAFT SEUL) */}
        {/* ───────────────────────────────────────────────────────── */}
        {isDraftMode && !loadingForm && (
          <View style={styles.legalNoticeContainer}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
              onPress={() => setHasAgreedToTerms(!hasAgreedToTerms)}
              activeOpacity={0.8}
            >
              {/* Checkbox Visuelle */}
              <View style={[
                styles.checkboxVisual, 
                { 
                  borderColor: hasAgreedToTerms ? '#4A78FF' : '#A3A3A3',
                  backgroundColor: hasAgreedToTerms ? '#4A78FF' : 'transparent'
                }
              ]}>
                {hasAgreedToTerms && (
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                )}
              </View>

              {/* Texte explicatif */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#171717', marginBottom: 4 }}>
                  Certification & Engagement Officiel
                </Text>
                <Text style={{ fontSize: 13, color: '#404040', lineHeight: 18 }}>
                  Je certifie sur l'honneur l'exactitude des informations fournies. Je comprends que la soumission de ce formulaire constitue un <Text style={{ fontWeight: '700' }}>engagement réel et officiel</Text> auprès du club, et valide mon adhésion sous réserve d'acceptation de mon dossier.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ACTIONS DU BAS */}
        {isDraftMode && !loadingForm && (
          <View style={{ marginTop: 10, gap: 12 }}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: '#F0F4FF', borderColor: '#4A78FF', borderWidth: 1 }]}
              onPress={handleDraftSave}
              disabled={isSubmitting || isSavingDraft || !!uploadingQuestionId}
            >
              {isSavingDraft ? <ActivityIndicator size="small" color="#4A78FF" /> : <Text style={[styles.submitButtonText, { color: '#4A78FF' }]}>Mettre à jour le brouillon</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton, 
                { backgroundColor: '#4A78FF' }, 
                (isSubmitting || isSavingDraft || !!uploadingQuestionId || !hasAgreedToTerms) && { opacity: 0.6 }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || isSavingDraft || !!uploadingQuestionId}
            >
              {isSubmitting ? <ActivityIndicator size="small" color="white" /> : <Text style={[styles.submitButtonText, { color: '#FFF' }]}>Envoyer mon dossier finalisé</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  formName: { fontSize: 18, fontWeight: '700', color: '#171717', marginBottom: 16 },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E5E5E5' },
  backButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#171717', flex: 1, textAlign: 'center' },
  deleteButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#FCE8E6' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  iconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statusBannerText: { marginLeft: 16, flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#737373', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  messageBubbleClub: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E5E5' },
  clubMessageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  clubMessageSender: { fontWeight: '700', color: '#171717', fontSize: 14 },
  clubMessageTime: { fontSize: 12, color: '#A3A3A3', fontWeight: '500' },
  clubMessageBody: { fontSize: 14, color: '#404040', lineHeight: 22 },
  emptyMessageContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5' },
  emptyMessageText: { fontSize: 13, color: '#737373', marginLeft: 12, flex: 1 },
  responsesCard: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: '#E5E5E5' },
  responseRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  responseQuestion: { fontSize: 13, fontWeight: '500', color: '#737373', marginBottom: 4 },
  responseValue: { fontSize: 14, fontWeight: '600', color: '#171717' },
  loaderContainer: { paddingVertical: 24, alignItems: 'center' },

  submitButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  submitButtonText: { fontSize: 14, fontWeight: '600' },

  // 💡 NOUVEAUX STYLES AJOUTÉS
  legalNoticeContainer: {
    backgroundColor: '#FFF9F3', 
    borderWidth: 1,
    borderColor: '#FFE2C5',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 20
  },
  checkboxVisual: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2 
  }
});