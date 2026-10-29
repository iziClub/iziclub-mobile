import { router } from "expo-router";
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
import { Colors } from "@/constants/colors";
import { Fonts, Spacing } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const isValidEmail = (mail: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handleResetPassword = () => {
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

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="ton@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Button
            label="Envoyer le lien de réinitialisation"
            size="l"
            fullWidth
            disabled={!isValidEmail(email)}
            onPress={handleResetPassword}
            style={{ marginTop: Spacing[4] }}
          />
          <Button variant="tertiaire" label="Retour à la connexion" onPress={() => router.push("/login")} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.blanc,
    paddingBottom: 20,
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
  },
  form: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[4],
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.titre,
    marginBottom: 12,
    paddingLeft: 20,
    color: Colors.noir,
  },
  subtitle: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});
