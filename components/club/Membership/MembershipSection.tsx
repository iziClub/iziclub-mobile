import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";

import MembershipHeader from "./MembershipHeader";
import ProfileCard from "./ProfileCard";
import QuestionCard from "./QuestionCard";
import LoginRequired from "./LoginRequired";

import { DynamicForm } from "./types";
import { styles } from "./styles";

// 💡 Imports des services (existants et futurs)
import { 
  getClubForm, 
} from "@/services/clubs.service";

import {createDraftSubmission, addAnswersToSubmission, submitFormSubmission} from "@/services/forms.service";

type Props = {
  club: any;
  isLoggedIn: boolean;
  user: any;
};

export default function MembershipSection({
  club,
  isLoggedIn,
  user,
}: Props) {
  const [currentForm, setCurrentForm] = useState<DynamicForm | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // 💡 Nouveaux états UX pour l'envoi du dossier
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

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
        console.error("Erreur lors de la récupération du formulaire:", error);
        Alert.alert("Erreur", "Impossible de charger le formulaire d'inscription.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [club?.id, isLoggedIn]);

  if (!isLoggedIn) return <LoginRequired />;

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

  // ─────────────────────────────────────────────────────────
  // Handlers des entrées du formulaire
  // ─────────────────────────────────────────────────────────
  const handleTextChange = (questionId: string, value: string) => {
    setFormResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleRadioSelect = (questionId: string, optionId: string) => {
    setFormResponses((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleCheckboxSelect = (questionId: string, optionId: string) => {
    const currentAnswers = formResponses[questionId] || [];
    const updatedAnswers = currentAnswers.includes(optionId)
      ? currentAnswers.filter((id: string) => id !== optionId)
      : [...currentAnswers, optionId];

    setFormResponses((prev) => ({ ...prev, [questionId]: updatedAnswers }));
  };

  const handleDocumentUpload = (questionId: string, fileName: string) => {
    setFormResponses((prev) => ({ ...prev, [questionId]: fileName }));
  };

  // 💡 Formater l'état de l'application vers la structure attendue par l'API
  const formatAnswersForApi = () => {
    return Object.entries(formResponses).map(([questionId, value]) => {
      let formattedValue = value;
      if (Array.isArray(value)) {
        formattedValue = value.join(", "); // Gère le tableau de chaînes pour les checkbox
      }
      return {
        questionId,
        value: String(formattedValue),
      };
    });
  };

  // 💡 Étape commune : Création du brouillon + Envoi des réponses
  const executeDraftWorkflow = async () => {
    // Étape 1 : Créer le brouillon (Draft)
    const draftResponse = await createDraftSubmission(currentForm.id);
    const submissionId = draftResponse?.data?.id || draftResponse?.id;

    if (!submissionId) {
      throw new Error("Impossible de récupérer l'identifiant de soumission (Submission ID).");
    }

    // Étape 2 : Préparer et pousser les réponses
    const formattedAnswers = formatAnswersForApi();
    
    // On n'appelle la route d'ajout que si l'utilisateur a répondu au moins à une question
    if (formattedAnswers.length > 0) {
      await addAnswersToSubmission(submissionId, { answers: formattedAnswers });
    }

    return submissionId;
  };

  // ─────────────────────────────────────────────────────────
  // Actions UI
  // ─────────────────────────────────────────────────────────
  
  // Action : Enregistrer en brouillon uniquement
  const handleDraftSave = async () => {
    setIsSavingDraft(true);
    try {
      await executeDraftWorkflow();
      Alert.alert("Brouillon sauvegardé", "Vos modifications ont bien été enregistrées.");
    } catch (error : any) {
      console.error("Erreur lors de la sauvegarde du brouillon:", error);
      console.error("Détails de l'erreur :", error.response?.data || error.message);
      Alert.alert("Erreur", "Impossible de sauvegarder votre brouillon pour le moment.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Action : Envoi final du dossier
  const handleSubmit = async () => {
    // Validation locale des champs obligatoires avant de lancer les appels API
    for (const question of currentForm.questions) {
      if (question.required) {
        const response = formResponses[question.id];
        if (!response || (Array.isArray(response) && response.length === 0)) {
          Alert.alert("Champ obligatoire", `Le champ "${question.name}" doit être renseigné.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Étape 1 et 2 : Création du brouillon et injection des réponses
      const submissionId = await executeDraftWorkflow();

      // Étape 3 : Validation définitive et finale (Submit)
      await submitFormSubmission(submissionId);

      Alert.alert("Félicitations !", "Votre dossier complet a été envoyé avec succès au club.");
      // Optionnel : Rediriger l'utilisateur vers son espace personnel ici
    } catch (error) {
      console.error("Erreur lors de la soumission définitive :", error);
      Alert.alert("Erreur lors de l'envoi", "Une erreur est survenue pendant la finalisation de votre dossier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <MembershipHeader form={currentForm} />
      <ProfileCard user={user} />

      {currentForm.questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          value={formResponses[question.id]}
          onTextChange={(value) => handleTextChange(question.id, value)}
          onRadioChange={(optionId) => handleRadioSelect(question.id, optionId)}
          onCheckboxChange={(optionId) => handleCheckboxSelect(question.id, optionId)}
          onDocumentUpload={() =>
            handleDocumentUpload(question.id, `fichier_${question.id}.pdf`)
          }
        />
      ))}

      {/* 💡 Amélioration UI/UX : Désactivation des boutons et loaders pendant les requêtes réseau */}
      <View style={{ marginTop: 20, gap: 12 }}>
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: '#F0F4FF', borderColor: '#4A78FF', borderWidth: 1 }]} 
          onPress={handleDraftSave}
          disabled={isSubmitting || isSavingDraft}
        >
          {isSavingDraft ? (
            <ActivityIndicator size="small" color="#4A78FF" />
          ) : (
            <Text style={[styles.submitButtonText, { color: '#4A78FF' }]}>Enregistrer en brouillon</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, (isSubmitting || isSavingDraft) && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isSubmitting || isSavingDraft}
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