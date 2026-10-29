import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Check } from "lucide-react-native";
import { Colors, Fonts, Radius, Spacing, TOUCH_MIN } from "@/constants/theme";

type ChoiceProps = {
  /** radio : choix unique, checkbox : choix multiple ou case à cocher seule */
  type?: "radio" | "checkbox";
  label: string;
  /** Texte sous le libellé (peut contenir du texte en gras) */
  description?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Ligne encadrée (option d'une question) ou nue (case seule dans un bloc) */
  framed?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Option radio ou case à cocher. Sélection en noir, comme les boutons et onglets. */
export default function Choice({
  type = "checkbox",
  label,
  description,
  selected,
  onPress,
  disabled,
  framed = true,
  style,
}: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={type}
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      style={({ pressed }) => [
        styles.row,
        framed && styles.framed,
        framed && selected && styles.framedSelected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          type === "radio" ? styles.radio : styles.box,
          selected && styles.controlSelected,
          disabled && styles.controlDisabled,
        ]}
      >
        {selected ? (
          type === "radio" ? (
            <View style={styles.radioDot} />
          ) : (
            <Check size={14} color={Colors.blanc} strokeWidth={3} />
          )
        ) : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const CONTROL = 22;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing[3],
    minHeight: TOUCH_MIN,
    paddingVertical: Spacing[3] - 1,
  },
  framed: {
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.m,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    marginBottom: Spacing[2],
  },
  framedSelected: { borderColor: Colors.noir, borderWidth: 1.5 },
  pressed: { opacity: 0.7 },
  box: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gris,
    alignItems: "center",
    justifyContent: "center",
  },
  radio: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.gris,
    alignItems: "center",
    justifyContent: "center",
  },
  controlSelected: { borderColor: Colors.noir, backgroundColor: Colors.noir },
  controlDisabled: { borderColor: Colors.grisClair, backgroundColor: Colors.grisClair },
  radioDot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: Colors.blanc },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: Colors.noir },
  labelSelected: { fontFamily: Fonts.medium },
  description: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: Colors.grisTexte },
});
