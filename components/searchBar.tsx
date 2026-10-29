import React from "react";
import { TextInput, View } from "react-native";
import { Colors } from "@/constants/colors";

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
        placeholderTextColor={Colors.gris}
        style={{
          backgroundColor: Colors.blanc,
          padding: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.grisClair,
          color: Colors.noir,
        }}
      />
    </View>
  );
}
