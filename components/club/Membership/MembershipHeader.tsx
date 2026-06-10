import React from "react";
import { View, Text } from "react-native";
import { DynamicForm } from "./types";
import { styles } from "./styles";

type Props = {
  form: DynamicForm;
};

export default function MembershipHeader({ form }: Props) {
  return (
    <View style={styles.headerInfo}>
      <Text style={styles.sectionTitle}>{form.name}</Text>

      {!!form.information && (
        <Text style={styles.description}>
          {form.information}
        </Text>
      )}

      <Text style={styles.dateText}>
        Formulaire publié le : {form.createdAt}
      </Text>
    </View>
  );
}