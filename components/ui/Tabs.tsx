import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, Fonts, Radius, Spacing, TOUCH_MIN } from "@/constants/theme";
import Icon from "./Icon";

export type TabItem<T extends string> = { value: T; label: string; icon?: string };

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

/** Onglets segmentés : actif fond noir / texte blanc, inactif gris-texte. */
export default function Tabs<T extends string>({ items, value, onChange, style }: TabsProps<T>) {
  return (
    <View style={[styles.container, style]} accessibilityRole="tablist">
      {items.map((item) => {
        const active = item.value === value;
        const fg = active ? Colors.blanc : Colors.grisTexte;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.tab,
              active && styles.active,
              pressed && !active && styles.pressed,
            ]}
          >
            {item.icon ? <Icon name={item.icon} size={16} color={fg} /> : null}
            <Text style={[styles.label, { color: fg }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.blanc,
    padding: Spacing[1],
    borderRadius: Radius.m,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
    minHeight: TOUCH_MIN - 2 * Spacing[1],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.s,
  },
  active: { backgroundColor: Colors.noir },
  pressed: { backgroundColor: Colors.fond },
  label: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
});
