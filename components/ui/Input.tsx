import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Colors, Fonts, Radius, Spacing, TOUCH_MIN } from "@/constants/theme";

type InputProps = TextInputProps & {
  label?: string;
  /** Texte d'aide sous le champ */
  hint?: string;
  /** Message d'erreur : remplace l'aide et passe la bordure en rouge */
  error?: string;
  required?: boolean;
  /** Champ mot de passe avec bouton afficher / masquer */
  password?: boolean;
  /** Élément à gauche dans le champ (icône loupe) */
  leading?: React.ReactNode;
  /** Élément à droite dans le champ (bouton effacer) */
  trailing?: React.ReactNode;
};

/** Champ de saisie commun : libellé au-dessus, aide ou erreur en dessous. */
export default function Input({
  label,
  hint,
  error,
  required,
  password,
  leading,
  trailing,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          !!error && styles.boxError,
        ]}
      >
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.gris}
          secureTextEntry={password && !visible}
          accessibilityLabel={label}
          aria-invalid={!!error}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {password ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            hitSlop={8}
            style={styles.eye}
          >
            {visible ? <EyeOff size={20} color={Colors.gris} /> : <Eye size={20} color={Colors.gris} />}
          </Pressable>
        ) : trailing ? (
          <View style={styles.trailing}>{trailing}</View>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.hint, styles.error]}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing[1], alignSelf: "stretch" },
  label: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, color: Colors.noir },
  required: { color: Colors.rouge },
  box: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: TOUCH_MIN,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    borderRadius: Radius.m,
    backgroundColor: Colors.blanc,
    paddingHorizontal: Spacing[3],
  },
  boxFocused: { borderColor: Colors.bleu, borderWidth: 2, paddingHorizontal: Spacing[3] - 1 },
  boxError: { borderColor: Colors.rouge },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.noir,
    paddingVertical: Spacing[3] - 2,
  },
  eye: { paddingLeft: Spacing[2] },
  leading: { paddingRight: Spacing[2] },
  trailing: { paddingLeft: Spacing[2] },
  hint: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, color: Colors.grisTexte },
  error: { color: Colors.rouge },
});
