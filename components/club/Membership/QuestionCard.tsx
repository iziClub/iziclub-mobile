import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Question } from "./types";
import { styles } from "./styles";

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
        <TextInput
          style={styles.input}
          value={value || ""}
          onChangeText={onTextChange}
          placeholder="Écris ta réponse ici..."
          placeholderTextColor="#A3A3A3"
        />
      )}

      {/* TYPE: DOCUMENT */}
      {question.type === "document" && (
        <TouchableOpacity
          style={[
            styles.uploadBox,
            isAnswered && styles.uploadBoxSuccess,
          ]}
          onPress={onDocumentUpload}
        >
          <Ionicons
            name={isAnswered ? "checkmark-circle" : "cloud-upload-outline"}
            size={22}
            color={isAnswered ? "#10B981" : "#737373"}
          />

          <View style={styles.uploadTextContainer}>
            <Text style={[styles.uploadTitle, isAnswered && { color: "#10B981", fontWeight: "600" }]}>
              {isAnswered ? value : "Sélectionner un fichier"}
            </Text>

            <Text style={styles.uploadSubtitle}>
              {isAnswered ? "Fichier ajouté avec succès" : "Clique pour ajouter un document"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* TYPE: RADIO */}
      {question.type === "radio" &&
        question.options?.map((option) => {
          // 💡 Comparaison basée sur le label textuel
          const selected = value === option.label;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                selected && styles.optionRowSelected,
              ]}
              // 💡 On renvoie le label
              onPress={() => onRadioChange(option.label)}
            >
              <Ionicons
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selected ? "#3B82F6" : "#A3A3A3"}
              />

              <Text
                style={[
                  styles.optionLabel,
                  selected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

      {/* TYPE: CHECKBOX */}
      {question.type === "checkbox" &&
        question.options?.map((option) => {
          // 💡 Vérification si le tableau de valeurs contient ce label précis
          const checked = value?.includes(option.label);

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                checked && styles.optionRowSelected,
              ]}
              // 💡 On renvoie le label
              onPress={() => onCheckboxChange(option.label)}
            >
              <Ionicons
                name={checked ? "checkbox" : "square-outline"}
                size={20}
                color={checked ? "#3B82F6" : "#A3A3A3"}
              />

              <Text
                style={[
                  styles.optionLabel,
                  checked && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}