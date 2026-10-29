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
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

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
            { marginTop: 32 },
            !isFormValid && styles.buttonDisabled,
          ]}
          onPress={handleNextStep}
          disabled={!isFormValid}
        >
          <Text style={[styles.buttonText, !isFormValid && { color: Colors.gris }]}>Créer un mot de passe</Text>
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
    backgroundColor: Colors.blanc,
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 350,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.titre,
    marginBottom: 20,
    paddingLeft: 20,
    color: Colors.noir,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 8,
    color: Colors.grisTexte,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grisClair,
    borderRadius: 12,
    padding: 12,
    width: "90%",
    marginBottom: 12,
    alignSelf: "center",
    color: Colors.noir,
    backgroundColor: Colors.blanc,
  },
  inputError: {
    borderColor: Colors.rouge,
  },
  errorText: {
    color: Colors.rouge,
    fontSize: 14, fontFamily: Fonts.regular,
    width: "90%",
    alignSelf: "center",
    marginTop: -8,
    marginBottom: 4,
  },
  button: {
    backgroundColor: Colors.noir,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "90%",
    marginBottom: 12,
    alignSelf: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.grisClair,
  },
  buttonText: {
    color: Colors.blanc,
    fontFamily: Fonts.medium,
    textAlign: "center",
    fontSize: 16,
  },
  forgotPassword: {
    color: Colors.bleu,
    textAlign: "center",
    marginTop: 8,
    textDecorationLine: "underline",
  },
});