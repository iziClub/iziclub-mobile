import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Colors, Fonts, Radius, Spacing, TOUCH_MIN } from "@/constants/theme";
import Icon from "./Icon";

export type ButtonVariant = "primaire" | "secondaire" | "tertiaire" | "danger" | "lien";

type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: ButtonVariant;
  /** "l" : CTA pleine largeur en bas d'écran (52 px) */
  size?: "m" | "l";
  /** Nom d'icône (voir components/ui/Icon), affichée à gauche du libellé */
  icon?: string;
  /** Élément libre à gauche du libellé (logo Google, image) */
  leading?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bouton commun iziClub.
 * Un seul `primaire` par écran. Le noir est la seule couleur de CTA ;
 * le rouge n'est utilisé que pour une action destructive.
 */
export default function Button({
  label,
  variant = "primaire",
  size = "m",
  icon,
  leading,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const fg = isDisabled && variant !== "lien" ? Colors.gris : FOREGROUND[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === "l" && styles.large,
        VARIANT[variant],
        pressed && PRESSED[variant],
        isDisabled && variant !== "lien" && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={fg} />
        ) : icon ? (
          <Icon name={icon} size={20} color={fg} />
        ) : (
          leading ?? null
        )}
        <Text
          style={[
            styles.label,
            size === "l" && styles.labelLarge,
            { color: fg },
            variant === "lien" && styles.labelLien,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const FOREGROUND: Record<ButtonVariant, string> = {
  primaire: Colors.blanc,
  secondaire: Colors.noir,
  tertiaire: Colors.noir,
  danger: Colors.blanc,
  lien: Colors.bleu,
};

const VARIANT = StyleSheet.create({
  primaire: { backgroundColor: Colors.noir },
  secondaire: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.noir },
  tertiaire: { backgroundColor: "transparent" },
  danger: { backgroundColor: Colors.rouge },
  lien: { backgroundColor: "transparent", minHeight: 0, paddingHorizontal: 0 },
});

const PRESSED = StyleSheet.create({
  primaire: { backgroundColor: Colors.noirSurvol },
  secondaire: { backgroundColor: Colors.grisClair },
  tertiaire: { backgroundColor: Colors.grisClair },
  danger: { opacity: 0.85 },
  lien: { opacity: 0.6 },
});

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_MIN,
    paddingHorizontal: Spacing[5],
    borderRadius: Radius.m,
    alignItems: "center",
    justifyContent: "center",
  },
  large: { minHeight: 52, paddingHorizontal: Spacing[6] },
  fullWidth: { alignSelf: "stretch" },
  disabled: { backgroundColor: Colors.grisClair, borderColor: Colors.grisClair },
  content: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  label: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, flexShrink: 1 },
  labelLarge: { fontSize: 16, lineHeight: 24 },
  labelLien: { textDecorationLine: "underline" },
});
