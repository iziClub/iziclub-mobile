import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

import { InscriptionStatus } from './inscriptions';
import QuestionCard from "@/components/club/Membership/QuestionCard"; 
import { Colors } from "@/constants/colors"; 

import {
  deleteSubmission,
  getFormByFormId,
  addAnswersToSubmission,
  submitFormSubmission,
  getUploadUrl
} from '@/services/forms.service';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import Choice from "@/components/ui/Choice";

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
  const isNeedsMoreInfo = status === 'needs_more_info';

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
      } else {
        setFormResponses({});
      }
    } catch (error) {
      console.error("Erreur métadonnées formulaire:", error);
    } finally {
      setLoadingForm(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFormStructure();
    }, [formId, params.answers])
  );

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

  // Resubmit flow when club requested more info
  const handleResubmit = async () => {
    if (!formStructure?.questions) return;

    for (const question of formStructure.questions) {
      if (question.required) {
        const response = formResponses[question.id];
        const hasValue = response && typeof response === "object" ? !!response.filePath : !!response;

        if (!hasValue || (Array.isArray(response) && response.length === 0)) {
          Alert.alert("Champ obligatoire", `Le champ \"${question.name}\" doit être renseigné.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = formatAnswersForApi();
      if (formattedAnswers.length > 0) {
        await addAnswersToSubmission(submissionId, { answers: formattedAnswers });
      }
      await submitFormSubmission(submissionId);
      Alert.alert("Soumission renvoyée", "Votre réponse a bien été renvoyée au club.", [
        { text: "OK", onPress: () => router.replace("/profile/inscriptions") }
      ]);
    } catch (error) {
      console.error("Erreur renvoi soumission :", error);
      Alert.alert("Erreur", "Impossible de renvoyer la soumission.");
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
      case 'approved': return { color: Colors.vert, bg: Colors.vertClair, label: 'Dossier Validé', icon: 'verified' };
      case 'rejected': return { color: Colors.rouge, bg: Colors.rougeClair, label: 'Dossier Refusé', icon: 'cancel' };
      case 'needs_more_info': return { color: Colors.noir, bg: Colors.grisClair, label: 'Action requise', icon: 'error' };
      case 'draft': return { color: Colors.bleu, bg: Colors.bleuClair, label: 'Brouillon', icon: 'edit' };
      default: return { color: Colors.bleu, bg: Colors.bleuClair, label: 'En cours d\'analyse', icon: 'hourglass-top' };
    }
  };

  const config = getStatusConfig(status);

  const getFileName = (value: any) => {
    if (!value) return '';

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return getFileName(parsed);
        } catch {
          // ignore invalid JSON and fallback to plain string
        }
      }
    }

    if (typeof value === 'object' && value !== null) {
      if ('fileName' in value && value.fileName) return value.fileName;
      if ('name' in value && value.name) return value.name;
      if ('filePath' in value && value.filePath) {
        const sanitized = String(value.filePath).split('/').filter(Boolean);
        return sanitized.length > 0 ? sanitized[sanitized.length - 1] : String(value.filePath);
      }
      if ('value' in value) return getFileName(value.value);
      return String(value);
    }

    if (typeof value === 'string') {
      const sanitized = value.split('/').filter(Boolean);
      if (sanitized.length > 0 && value.match(/\.[a-zA-Z0-9]{1,5}$/)) {
        return sanitized[sanitized.length - 1];
      }
      return value;
    }

    return String(value);
  };

  const isMetaAnswerKey = (key: string) => {
    const normalized = key?.toLowerCase()?.replace(/[-_ ]/g, '');
    return ['filename', 'filepath', 'file_path', 'file-path', 'path'].includes(normalized);
  };

  const normalizeId = (id: any) => String(id ?? "").trim();

  const getDisplayAnswers = () => {
    const rawAnswers = JSON.parse(params.answers as string || '[]');
    const questionIds = new Set((formStructure?.questions || []).map((q: any) => normalizeId(q.id)));

    return rawAnswers
      .filter((ans: any) => {
        const id = normalizeId(ans.questionId);
        if (!id) return false;
        if (questionIds.has(id)) return true;
        return !isMetaAnswerKey(id);
      })
      .map((ans: any) => ({ ...ans, value: ans.value }));
  };

  const getReadableAnswer = (answer: any) => {
    const questionId = answer?.questionId || '';
    const rawValue = answer?.value ?? answer?.filePath ?? answer;

    const isDocument =
      (typeof rawValue === 'object' && rawValue !== null && 'filePath' in rawValue) ||
      (typeof rawValue === 'string' && rawValue.includes('form-submissions/'));

    if (!formStructure || !formStructure.questions) {
      return {
        title: questionId || 'Question',
        textValue: isDocument ? 'Fichier déposé' : String(rawValue)
      };
    }

    const question = formStructure.questions.find((q: any) => normalizeId(q.id) === normalizeId(questionId));
    const title = question?.name || questionId || 'Question';

    if (!rawValue || (Array.isArray(rawValue) && rawValue.length === 0)) {
      return { title, textValue: 'Non renseigné' };
    }

    if (isDocument) {
      return { title, textValue: 'Fichier déposé' };
    }

    let textValue = '';
    if (Array.isArray(rawValue)) {
      textValue = rawValue.join(', ');
    } else {
      textValue = String(rawValue);
    }

    return { title, textValue };
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />

        <Text style={styles.headerTitle}>{isDraftMode ? "Modifier le brouillon" : "Détail de la demande"}</Text>

        <IconButton
          name="trash-outline"
          variant="fantome"
          color={Colors.rouge}
          accessibilityLabel="Supprimer la demande"
          onPress={handleDeleteInscription}
          disabled={isDeleting}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.formName}>{formName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Icon name="business-outline" size={14} color={Colors.grisTexte} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 14, color: Colors.grisTexte, fontFamily: Fonts.medium }}>
              Destinataire : <Text style={{ color: Colors.noir, fontFamily: Fonts.medium }}>{clubName}</Text>
            </Text>
          </View>
        </View>

        {/* BANNIÈRE DE STATUT */}
        <View style={[styles.statusBanner, { backgroundColor: config.bg, borderColor: config.color + '20' }]}>
          <View style={[styles.iconWrapper, { backgroundColor: Colors.blanc }]}>
            <Icon name={config.icon as any} size={24} color={config.color} />
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
                <Icon name="chatbox-ellipses-outline" size={24} color={Colors.gris} />
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
              <ActivityIndicator size="small" color={Colors.noir} />
            </View>
          ) : (isDraftMode || isNeedsMoreInfo) && formStructure?.questions ? (
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
              {getDisplayAnswers().map((ans: any, index: number, arr: any[]) => {
                const mapped = getReadableAnswer(ans);
                return (
                  <View
                    key={ans.questionId || index}
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
        {(isDraftMode || isNeedsMoreInfo) && !loadingForm && (
          <View style={styles.legalNoticeContainer}>
            <Choice
              framed={false}
              label="Certification & Engagement Officiel"
              selected={hasAgreedToTerms}
              onPress={() => setHasAgreedToTerms(!hasAgreedToTerms)}
              description={
                <>
                  Je certifie sur l'honneur l'exactitude des informations fournies. Je comprends que la soumission de ce formulaire constitue un <Text style={{ fontFamily: Fonts.medium, color: Colors.noir }}>engagement réel et officiel</Text> auprès du club, et valide mon adhésion sous réserve d'acceptation de mon dossier.
                </>
              }
            />
          </View>
        )}

        {/* ACTIONS DU BAS */}
        {(isDraftMode || isNeedsMoreInfo) && !loadingForm && (
          <View style={{ marginTop: 12, gap: 12 }}>
            <Button
              label="Mettre à jour le brouillon"
              variant="secondaire"
              size="l"
              loading={isSavingDraft}
              onPress={handleDraftSave}
              disabled={isSubmitting || isSavingDraft || !!uploadingQuestionId}
            />

            <Button
              label={isNeedsMoreInfo ? 'Renvoyer la soumission' : 'Envoyer mon dossier finalisé'}
              size="l"
              loading={isSubmitting}
              onPress={isNeedsMoreInfo ? handleResubmit : handleSubmit}
              disabled={isSubmitting || isSavingDraft || !!uploadingQuestionId}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  formName: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir, marginBottom: 16 },
  container: { flex: 1, backgroundColor: Colors.fond },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, backgroundColor: Colors.blanc, borderBottomWidth: 1, borderColor: Colors.grisClair },
  headerTitle: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir, flex: 1, textAlign: 'center' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  iconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.noir, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statusBannerText: { marginLeft: 16, flex: 1 },
  statusLabel: { fontSize: 16, fontFamily: Fonts.medium },
  statusSubtitle: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.grisTexte, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  messageBubbleClub: { backgroundColor: Colors.blanc, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.grisClair },
  clubMessageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  clubMessageSender: { fontFamily: Fonts.medium, color: Colors.noir, fontSize: 14 },
  clubMessageTime: { fontSize: 12, color: Colors.grisTexte, fontFamily: Fonts.medium },
  clubMessageBody: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.noir, lineHeight: 22 },
  emptyMessageContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.blanc, borderRadius: 16, borderWidth: 1, borderColor: Colors.grisClair },
  emptyMessageText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, marginLeft: 12, flex: 1 },
  responsesCard: { backgroundColor: Colors.blanc, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: Colors.grisClair },
  responseRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.grisClair },
  responseQuestion: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.grisTexte, marginBottom: 4 },
  responseValue: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.noir },
  loaderContainer: { paddingVertical: 24, alignItems: 'center' },


  legalNoticeContainer: {
    backgroundColor: Colors.blanc, 
    borderWidth: 1,
    borderColor: Colors.grisClair,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 20
  },
});