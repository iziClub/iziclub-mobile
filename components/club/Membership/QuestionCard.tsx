import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Question } from "./types";
import { styles } from "./styles";

type Props = {
  question: Question;
  value: any;
  onTextChange: (value: string) => void;
  onRadioChange: (optionId: string) => void;
  onCheckboxChange: (optionId: string) => void;
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
            <Text style={styles.requiredStar}>
              {" "}*
            </Text>
          )}
        </Text>
      </View>

      {!!question.description && (
        <Text style={styles.hintText}>
          {question.description}
        </Text>
      )}

      {question.type === "text" && (
        <TextInput
          style={styles.input}
          value={value || ""}
          onChangeText={onTextChange}
          placeholder="Écris ta réponse ici..."
        />
      )}

      {question.type === "document" && (
        <TouchableOpacity
          style={[
            styles.uploadBox,
            isAnswered &&
              styles.uploadBoxSuccess,
          ]}
          onPress={onDocumentUpload}
        >
          <Ionicons
            name={
              isAnswered
                ? "checkmark-circle"
                : "cloud-upload-outline"
            }
            size={24}
            color={
              isAnswered
                ? "#2E7D32"
                : "#555"
            }
          />

          <View style={styles.uploadTextContainer}>
            <Text style={styles.uploadTitle}>
              {isAnswered
                ? value
                : "Sélectionner un fichier"}
            </Text>

            <Text style={styles.uploadSubtitle}>
              Clique pour ajouter un document
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {question.type === "radio" &&
        question.options?.map((option) => {
          const selected =
            value === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                selected &&
                  styles.optionRowSelected,
              ]}
              onPress={() =>
                onRadioChange(option.id)
              }
            >
              <Ionicons
                name={
                  selected
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
              />

              <Text
                style={[
                  styles.optionLabel,
                  selected &&
                    styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

      {question.type === "checkbox" &&
        question.options?.map((option) => {
          const checked =
            value?.includes(option.id);

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                checked &&
                  styles.optionRowSelected,
              ]}
              onPress={() =>
                onCheckboxChange(option.id)
              }
            >
              <Ionicons
                name={
                  checked
                    ? "checkbox"
                    : "square-outline"
                }
                size={20}
              />

              <Text
                style={[
                  styles.optionLabel,
                  checked &&
                    styles.optionLabelSelected,
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