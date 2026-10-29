import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import { Question } from "./types";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

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
          placeholderTextColor={Colors.gris}
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
          <Icon
            name={isAnswered ? "checkmark-circle" : "cloud-upload-outline"}
            size={22}
            color={isAnswered ? Colors.vert : Colors.gris}
          />

          <View style={styles.uploadTextContainer}>
            <Text style={[styles.uploadTitle, isAnswered && { color: Colors.vert, fontFamily: Fonts.medium }]}>
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
              <Icon
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selected ? Colors.noir : Colors.gris}
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
              <Icon
                name={checked ? "checkbox" : "square-outline"}
                size={20}
                color={checked ? Colors.noir : Colors.gris}
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