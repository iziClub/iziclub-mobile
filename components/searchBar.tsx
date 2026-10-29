import React from "react";
import { View } from "react-native";
import { Colors } from "@/constants/colors";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";

interface SearchbarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function Searchbar({ value, onChangeText }: SearchbarProps) {
  return (
    <View style={{ padding: 16 }}>
      <Input
        accessibilityLabel="Rechercher un club"
        placeholder="Rechercher un club..."
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        leading={<Icon name="search" size={20} color={Colors.gris} />}
      />
    </View>
  );
}
