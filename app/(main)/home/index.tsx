import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import React from "react";

export default function Home() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Bienvenue dans l'app !</Text>

      <TouchableOpacity
        onPress={() => router.push("/search")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#007AFF",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Chercher un club</Text>
      </TouchableOpacity>
    </View>
  );
}
