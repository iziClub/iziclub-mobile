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
import { router } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Vérifie si l'adresse email est valide
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Vérifie si le formulaire est valide
  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isValidEmail(email.trim());

  const handleNextStep = () => {
    if (!isFormValid) {
      return;
    }

    router.push({
      pathname: "/passwordCreation",
      params: {
        email: email.toLowerCase().trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    });
  };

  const handleAlreadyAccount = () => {
    router.push("/login");
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

        <Text style={styles.title}>Inscris-toi</Text>

        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton prénom"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Nom de famille</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton nom de famille"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            email.length > 0 && !isValidEmail(email.trim())
              ? styles.inputError
              : null,
          ]}
          placeholder="Ton adresse email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        {email.length > 0 && !isValidEmail(email.trim()) && (
          <Text style={styles.errorText}>
            Veuillez entrer une adresse email valide.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { marginTop: 30 },
            !isFormValid && styles.buttonDisabled,
          ]}
          onPress={handleNextStep}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Créer un mot de passe</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAlreadyAccount}>
          <Text style={styles.forgotPassword}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 350,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    paddingLeft: 20,
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
    marginBottom: 12,
    alignSelf: "center",
  },
  inputError: {
    borderColor: "#D32F2F",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    width: "90%",
    alignSelf: "center",
    marginTop: -8,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#0E011A",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    marginBottom: 12,
    alignSelf: "center",
  },
  buttonDisabled: {
    backgroundColor: "#B8B4B1",
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