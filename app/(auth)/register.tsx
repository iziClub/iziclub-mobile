import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { Fonts, Spacing } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

        <View style={styles.form}>
          <Input
            label="Prénom"
            placeholder="Ton prénom"
            value={firstName}
            onChangeText={setFirstName}
            autoComplete="given-name"
          />
          <Input
            label="Nom de famille"
            placeholder="Ton nom de famille"
            value={lastName}
            onChangeText={setLastName}
            autoComplete="family-name"
          />
          <Input
            label="Email"
            placeholder="Ton adresse email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            autoComplete="email"
            error={
              email.length > 0 && !isValidEmail(email.trim())
                ? "Veuillez entrer une adresse email valide."
                : undefined
            }
          />
          <Button
            label="Créer un mot de passe"
            size="l"
            fullWidth
            onPress={handleNextStep}
            disabled={!isFormValid}
            style={{ marginTop: Spacing[4] }}
          />
          <Button variant="tertiaire" label="J'ai déjà un compte" onPress={handleAlreadyAccount} />
        </View>
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
  form: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[4],
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.titre,
    marginBottom: 20,
    paddingLeft: 20,
    color: Colors.noir,
  },
});