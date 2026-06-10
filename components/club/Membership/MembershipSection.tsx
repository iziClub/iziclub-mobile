import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";

import MembershipHeader from "./MembershipHeader";
import ProfileCard from "./ProfileCard";
import QuestionCard from "./QuestionCard";
import LoginRequired from "./LoginRequired";

import { DynamicForm } from "./types";
import { styles } from "./styles";

// temporaire
const mockForm: DynamicForm = {
  id: "football_senior_2026",
  name: "Inscription Football Senior 2026-2027",
  status: "active",
  createdAt: "10 Juin 2026",
  information:
    "Merci de compléter l'ensemble des informations demandées afin que le club puisse valider votre inscription.",

  questions: [
    {
      id: "licence_number",
      type: "text",
      name: "Numéro de licence FFF",
      description:
        "À renseigner uniquement si vous êtes déjà licencié dans un autre club.",
      required: false,
    },

    {
      id: "emergency_contact",
      type: "text",
      name: "Personne à contacter en cas d'urgence",
      description:
        "Nom, prénom et numéro de téléphone.",
      required: true,
    },

    {
      id: "medical_certificate",
      type: "document",
      name: "Certificat médical",
      description:
        "PDF, JPG ou PNG. Obligatoire pour les nouveaux licenciés.",
      required: true,
    },

    {
      id: "identity_photo",
      type: "document",
      name: "Photo d'identité",
      description:
        "Photo récente utilisée pour votre licence officielle.",
      required: true,
    },

    {
      id: "identity_card",
      type: "document",
      name: "Carte d'identité",
      description:
        "Recto-verso en PDF ou image.",
      required: true,
    },

    {
      id: "jersey_size",
      type: "radio",
      name: "Taille du maillot",
      description:
        "Choisissez votre taille habituelle.",
      required: true,
      options: [
        {
          id: "xs",
          label: "XS",
        },
        {
          id: "s",
          label: "S",
        },
        {
          id: "m",
          label: "M",
        },
        {
          id: "l",
          label: "L",
        },
        {
          id: "xl",
          label: "XL",
        },
        {
          id: "xxl",
          label: "XXL",
        },
      ],
    },

    {
      id: "dominant_foot",
      type: "radio",
      name: "Pied dominant",
      description:
        "Information utile pour les entraîneurs.",
      required: true,
      options: [
        {
          id: "left",
          label: "Gauche",
        },
        {
          id: "right",
          label: "Droit",
        },
        {
          id: "both",
          label: "Les deux",
        },
      ],
    },

    {
      id: "positions",
      type: "checkbox",
      name: "Postes préférés",
      description:
        "Plusieurs réponses possibles.",
      required: false,
      options: [
        {
          id: "goalkeeper",
          label: "Gardien",
        },
        {
          id: "defender",
          label: "Défenseur",
        },
        {
          id: "midfielder",
          label: "Milieu",
        },
        {
          id: "winger",
          label: "Ailier",
        },
        {
          id: "striker",
          label: "Attaquant",
        },
      ],
    },

    {
      id: "authorizations",
      type: "checkbox",
      name: "Autorisations",
      description:
        "Merci de cocher les autorisations applicables.",
      required: true,
      options: [
        {
          id: "image_rights",
          label:
            "J'autorise le club à utiliser des photos de moi sur ses supports de communication",
        },
        {
          id: "transport",
          label:
            "J'autorise le transport lors des déplacements sportifs",
        },
        {
          id: "rules",
          label:
            "Je reconnais avoir pris connaissance du règlement intérieur",
        },
      ],
    },
  ],
};

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
  const [currentForm] =
    useState<DynamicForm>(mockForm);

  const [formResponses, setFormResponses] =
    useState<Record<string, any>>({});

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  const handleTextChange = (
    questionId: string,
    value: string
  ) => {
    setFormResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleRadioSelect = (
    questionId: string,
    optionId: string
  ) => {
    setFormResponses((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleCheckboxSelect = (
    questionId: string,
    optionId: string
  ) => {
    const currentAnswers =
      formResponses[questionId] || [];

    const updatedAnswers =
      currentAnswers.includes(optionId)
        ? currentAnswers.filter(
            (id: string) => id !== optionId
          )
        : [...currentAnswers, optionId];

    setFormResponses((prev) => ({
      ...prev,
      [questionId]: updatedAnswers,
    }));
  };

  const handleDocumentUpload = (
    questionId: string,
    fileName: string
  ) => {
    setFormResponses((prev) => ({
      ...prev,
      [questionId]: fileName,
    }));
  };

  const handleSubmit = () => {
    for (const question of currentForm.questions) {
      if (question.required) {
        const response =
          formResponses[question.id];

        if (
          !response ||
          (Array.isArray(response) &&
            response.length === 0)
        ) {
          Alert.alert(
            "Erreur",
            `Le champ "${question.name}" est obligatoire.`
          );
          return;
        }
      }
    }

    console.log({
      formId: currentForm.id,
      responses: formResponses,
    });

    Alert.alert(
      "Succès",
      "Ton dossier a été envoyé au club !"
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <MembershipHeader form={currentForm} />

      <ProfileCard user={user} />

      {currentForm.questions.map(
        (question) => (
          <QuestionCard
            key={question.id}
            question={question}
            value={
              formResponses[question.id]
            }
            onTextChange={(value) =>
              handleTextChange(
                question.id,
                value
              )
            }
            onRadioChange={(optionId) =>
              handleRadioSelect(
                question.id,
                optionId
              )
            }
            onCheckboxChange={(
              optionId
            ) =>
              handleCheckboxSelect(
                question.id,
                optionId
              )
            }
            onDocumentUpload={() =>
              handleDocumentUpload(
                question.id,
                `fichier_${question.id}.pdf`
              )
            }
          />
        )
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>
          Envoyer mon dossier
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}