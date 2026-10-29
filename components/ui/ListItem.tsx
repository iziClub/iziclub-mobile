import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, Fonts, Spacing, TOUCH_MIN } from "@/constants/theme";
import Icon from "./Icon";

type ListItemProps = {
  label: string;
  /** Texte secondaire sous le libellé */
  description?: string;
  /** Nom d'icône à gauche */
  icon?: string;
  onPress?: () => void;
  /** Action destructive (déconnexion, suppression) : libellé et icône en rouge */
  danger?: boolean;
  /** Chevron à droite, affiché par défaut si la ligne est cliquable */
  chevron?: boolean;
  /** Élément à droite (badge, switch) à la place du chevron */
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Ligne de liste : icône, libellé, chevron. Hauteur minimale 44 px. */
export default function ListItem({
  label,
  description,
  icon,
  onPress,
  danger,
  chevron = !!onPress,
  trailing,
  style,
}: ListItemProps) {
  const fg = danger ? Colors.rouge : Colors.noir;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
    >
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
      <View style={styles.text}>
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {trailing ?? (chevron ? <Icon name="chevron-forward" size={18} color={Colors.gris} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    minHeight: TOUCH_MIN + 4,
    paddingVertical: Spacing[3],
  },
  pressed: { opacity: 0.6 },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24 },
  description: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: Colors.grisTexte },
});
