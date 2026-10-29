import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { Colors, Radius, Spacing } from "@/constants/theme";

type CardProps = Omit<ViewProps, "style"> & {
  onPress?: () => void;
  onLongPress?: () => void;
  /** Bordure gris-clair : uniquement quand la carte est posée sur un fond blanc */
  bordered?: boolean;
  /** Padding intérieur (space-4 par défaut, 0 pour une carte avec image en bord à bord) */
  padding?: number;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Conteneur de carte : fond blanc, coins 16 px, sans ombre.
 * Cliquable si onPress est fourni (opacité légère à l'appui).
 */
export default function Card({
  onPress,
  onLongPress,
  bordered = false,
  padding = Spacing[4],
  disabled,
  style,
  children,
  ...rest
}: CardProps) {
  const base = [styles.card, bordered && styles.bordered, { padding }];
  if (!onPress && !onLongPress) {
    return (
      <View style={[...base, style]} {...rest}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [...base, pressed && styles.pressed, style]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.blanc,
    borderRadius: Radius.l,
    overflow: "hidden",
  },
  bordered: { borderWidth: 1, borderColor: Colors.grisClair },
  pressed: { opacity: 0.85 },
});
