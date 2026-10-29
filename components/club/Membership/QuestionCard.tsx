import React from "react";
import { View, Text, Pressable } from "react-native";

import { Question } from "./types";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import Choice from "@/components/ui/Choice";

type Props = {
  question: Question;
  value: any;
  onTextChange: (value: string) => void;
  // 💡 On passe des labels textuels (string) désormais
  onRadioChange: (optionLabel: string) => void;
  onCheckboxChange: (optionLabel: string) => void;
  onDocumentUpload: () => void;
};

export default function QuestionCard({
  question,
  value,
  onTextChange,
  onRadioChange,
  onCheckboxChange,
  onDocumentUpload,
}: Props) {
  const isAnswered = !!value;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.questionTitle}>
          {question.name}
          {question.required && (
            <Text style={styles.requiredStar}> *</Text>
          )}
        </Text>
      </View>

      {!!question.description && (
        <Text style={styles.hintText}>
          {question.description}
        </Text>
      )}

      {/* TYPE: TEXT */}
      {question.type === "text" && (
        <Input
          accessibilityLabel={question.name}
          value={value || ""}
          onChangeText={onTextChange}
          placeholder="Écris ta réponse ici..."
        />
      )}

      {/* TYPE: DOCUMENT */}
      {question.type === "document" && (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.uploadBox,
            pressed && { backgroundColor: Colors.fond },
            isAnswered && styles.uploadBoxSuccess,
          ]}
          onPress={onDocumentUpload}
        >
          <Icon
            name={isAnswered ? "checkmark-circle" : "cloud-upload-outline"}
            size={22}
            color={isAnswered ? Colors.vert : Colors.gris}
          />

          <View style={styles.uploadTextContainer}>
            <Text style={[styles.uploadTitle, isAnswered && { fontFamily: Fonts.medium }]}>
              {isAnswered ? value : "Sélectionner un fichier"}
            </Text>

            <Text style={styles.uploadSubtitle}>
              {isAnswered ? "Fichier ajouté avec succès" : "Clique pour ajouter un document"}
            </Text>
          </View>
        </Pressable>
      )}

      {/* TYPE: RADIO */}
      {question.type === "radio" &&
        question.options?.map((option) => {
          // 💡 Comparaison basée sur le label textuel
          const selected = value === option.label;

          return (
            <Choice
              key={option.id}
              type="radio"
              label={option.label}
              selected={selected}
              // 💡 On renvoie le label
              onPress={() => onRadioChange(option.label)}
            />
          );
        })}

      {/* TYPE: CHECKBOX */}
      {question.type === "checkbox" &&
        question.options?.map((option) => {
          // 💡 Vérification si le tableau de valeurs contient ce label précis
          const checked = value?.includes(option.label);

          return (
            <Choice
              key={option.id}
              type="checkbox"
              label={option.label}
              selected={!!checked}
              // 💡 On renvoie le label
              onPress={() => onCheckboxChange(option.label)}
            />
          );
        })}
    </View>
  );
}