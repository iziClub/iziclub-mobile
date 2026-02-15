import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const isValidEmail = (mail: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handleResetPassword = () => {
    console.log("Demande de reset envoyée pour :", email);
    alert("Un email de réinitialisation a été envoyé !");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/images/background-auth.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Mot de passe oublié ?</Text>

        <Text style={styles.subtitle}>
          Entre ton adresse email pour recevoir un lien de réinitialisation.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="ton@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isValidEmail(email) ? "#0E011A" : "#ccc" },
          ]}
          disabled={!isValidEmail(email)}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>
            Envoyer le lien de réinitialisation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.forgotPassword}>
            Retour à la connexion
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    paddingLeft: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    width: "90%",
    marginBottom: 20,
    alignSelf: "center",
  },
  button: {
    padding: 20,
    borderRadius: 8,
    width: "90%",
    marginBottom: 12,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  forgotPassword: {
    color: "#B8B4B1",
    textAlign: "right",
    marginBottom: 12,
    textDecorationLine: "underline",
    paddingRight: 20,
  },
});
