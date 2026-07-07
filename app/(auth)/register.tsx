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

  const handleNextStep = () => {
    if (!email || !firstName || !lastName) {
      alert("Oups ! Il manque des informations pour continuer.");
      return;
    }

    // On passe les données à l'écran de création de mot de passe
    router.push({
      pathname: "/passwordCreation",
      params: { 
        email: email.toLowerCase().trim(), 
        first_name: firstName.trim(), 
        last_name: lastName.trim() 
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
          style={styles.input}
          placeholder="Ton adresse email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity 
          style={[styles.button, { marginTop: 30 }]} 
          onPress={handleNextStep}
        >
          <Text style={styles.buttonText}>Créer un mot de passe</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAlreadyAccount}>
          <Text style={styles.forgotPassword}>J'ai déjà un compte</Text>
        </TouchableOpacity>

        {/* <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>Ou</Text>
          <View style={styles.line} />
        </View> */}

        {/* <TouchableOpacity style={[styles.button, styles.googleButton]}>
          <Image
            source={require("../../assets/images/google-logo.png")}
            style={styles.googleIcon}
          />
          <Text style={[styles.buttonText, { color: "black" }]}>
            S'inscrire avec Google
          </Text>
        </TouchableOpacity> */}
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
    height: 350, // Réduit légèrement pour laisser de la place aux nouveaux champs
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
  button: {
    backgroundColor: "#0E011A",
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
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "90%",
    alignSelf: "center"
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  googleButton: {
    backgroundColor: "#F7F6F5", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee"
  },
  googleIcon: {
    width: 20, 
    height: 20, 
    marginRight: 10 
  }
});