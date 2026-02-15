import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
      <Text>Bienvenue sur le profil</Text>
      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#007AFF",
          borderRadius: 8,
          width: 200,
        }}
      >
        <Text style={{ color: "white" }}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#007AFF",
          borderRadius: 8,
          width: 200,
        }}
      >
        <Text style={{ color: "white" }}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/passwordCreation")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#007AFF",
          borderRadius: 8,
          width: 200,
        }}
      >
        <Text style={{ color: "white" }}>PasswordCreationScreen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/forgetPassword")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#007AFF",
          borderRadius: 8,
          width: 200,
        }}
      >
        <Text style={{ color: "white" }}>Forget Password</Text>
      </TouchableOpacity>
    </View>
  );
}
