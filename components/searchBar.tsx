import React from "react";
import { TextInput, View } from "react-native";

interface SearchbarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function Searchbar({ value, onChangeText }: SearchbarProps) {
  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Rechercher un club..."
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={"#818181ff"}
        style={{
          backgroundColor: "#f1f1f1",
          padding: 12,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
