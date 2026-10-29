import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import Icon from "./Icon";

export type TagVariant = "contour" | "actif" | "doux" | "neutre" | "succes" | "danger";

type TagProps = {
  label: string;
  /**
   * contour : bordure noire, pastille de couleur (sport, état)
   * actif : fond noir, texte blanc (filtre sélectionné, mise en avant)
   * doux : fond bleu-clair (niveau, public, info neutre)
   * neutre : fond gris-clair (info secondaire)
   * succes : fond vert-clair (validé)
   * danger : fond rouge-clair (complet, refusé)
   */
  variant?: TagVariant;
  /** Pastille de couleur à gauche (variante contour) */
  dot?: string;
  /** Nom d'icône à gauche du libellé */
  icon?: string;
  /** Rend le tag cliquable (filtre) */
  onPress?: () => void;
  /** Filtre sélectionné : force la variante actif */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Étiquette en pill. Cliquable, elle sert de filtre (chip). */
export default function Tag({
  label,
  variant = "contour",
  dot,
  icon,
  onPress,
  selected,
  style,
}: TagProps) {
  const v: TagVariant = selected ? "actif" : variant;
  const fg = v === "actif" ? Colors.blanc : Colors.noir;
  const content = (
    <>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={[styles.base, VARIANT[v], style]}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        styles.pressable,
        VARIANT[v],
        pressed && v !== "actif" && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const VARIANT = StyleSheet.create({
  contour: { borderWidth: 1.5, borderColor: Colors.noir, backgroundColor: "transparent" },
  actif: { borderWidth: 1.5, borderColor: Colors.noir, backgroundColor: Colors.noir },
  doux: { borderWidth: 1.5, borderColor: Colors.bleuClair, backgroundColor: Colors.bleuClair },
  neutre: { borderWidth: 1.5, borderColor: Colors.grisClair, backgroundColor: Colors.grisClair },
  succes: { borderWidth: 1.5, borderColor: Colors.vertClair, backgroundColor: Colors.vertClair },
  danger: { borderWidth: 1.5, borderColor: Colors.rougeClair, backgroundColor: Colors.rougeClair },
});

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing[1] + 2,
    paddingVertical: 6,
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
  },
  /** Filtre : cible plus haute */
  pressable: { minHeight: 36, paddingHorizontal: Spacing[4] },
  pressed: { backgroundColor: Colors.grisClair },
  dot: { width: 8, height: 8, borderRadius: Radius.full },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
});
