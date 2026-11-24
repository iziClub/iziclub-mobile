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
  Alert,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Spacing } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { requestPasswordReset } from "@/services/account.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const isValidEmail = (mail: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handleResetPassword = async () => {
    setSending(true);
    try {
      await requestPasswordReset(email);
      Alert.alert(
        "Email envoyé",
        "Si un compte existe avec cette adresse, tu vas recevoir un lien pour choisir un nouveau mot de passe.",
        [{ text: "OK", onPress: () => router.dismissTo("/login") }]
      );
    } catch (e: any) {
      Alert.alert(
        "Envoi impossible",
        e?.response?.status === 429
          ? "Trop de demandes. Réessaie dans quelques minutes."
          : "Une erreur est survenue. Vérifie ta connexion et réessaie."
      );
    } finally {
      setSending(false);
    }
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
          source={require("../../assets/illustrations/tennis.png")}
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
            disabled={!isValidEmail(email) || sending}
            loading={sending}
            onPress={handleResetPassword}
            style={{ marginTop: Spacing[4] }}
          />
          <Button variant="tertiaire" label="Retour à la connexion" onPress={() => router.dismissTo("/login")} />
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
    width: "80%",
    maxWidth: 260,
    height: 220,
    alignSelf: "center",
    marginVertical: Spacing[5],
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
