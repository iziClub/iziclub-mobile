import React from "react";
import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Colors, Radius, TOUCH_MIN } from "@/constants/theme";
import Icon from "./Icon";

export type IconButtonVariant = "surface" | "plein" | "fantome";

type IconButtonProps = Omit<PressableProps, "style" | "children"> & {
  /** Nom d'icône (voir components/ui/Icon) */
  name: string;
  /** Obligatoire : un bouton sans texte doit être annoncé par le lecteur d'écran */
  accessibilityLabel: string;
  /**
   * surface : fond blanc, bordure gris-clair (retour, actions sur image)
   * plein : fond noir, icône blanche (action principale flottante)
   * fantome : sans fond (icône dans une ligne ou un en-tête)
   */
  variant?: IconButtonVariant;
  iconSize?: number;
  /** Couleur de l'icône, par défaut selon la variante */
  color?: string;
  /** Icône pleine (cœur, signet actifs) */
  filled?: boolean;
  /** Requête en cours : remplace l'icône par un indicateur et désactive le bouton */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Bouton icône seul, cible tactile de 44 px minimum. */
export default function IconButton({
  name,
  variant = "surface",
  iconSize = 20,
  color,
  loading = false,
  disabled,
  accessibilityState,
  style,
  ...rest
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const fg = disabled ? Colors.gris : color ?? (variant === "plein" ? Colors.blanc : Colors.noir);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        VARIANT[variant],
        pressed && PRESSED[variant],
        disabled && variant !== "fantome" && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : <Icon name={name} size={iconSize} color={fg} />}
    </Pressable>
  );
}

const VARIANT = StyleSheet.create({
  surface: { backgroundColor: Colors.blanc, borderWidth: 1, borderColor: Colors.grisClair },
  plein: { backgroundColor: Colors.noir },
  fantome: { backgroundColor: "transparent" },
});

const PRESSED = StyleSheet.create({
  surface: { backgroundColor: Colors.fond },
  plein: { backgroundColor: Colors.noirSurvol },
  fantome: { backgroundColor: Colors.grisClair },
});

const styles = StyleSheet.create({
  base: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { backgroundColor: Colors.grisClair, borderColor: Colors.grisClair },
});
