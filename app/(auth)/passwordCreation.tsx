import React, { useState } from "react";
import Checkbox from "expo-checkbox";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { registerUser } from "../../services/auth";
import { Colors } from "@/constants/colors";
import { Fonts, Spacing } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function PasswordCreationScreen() {
  const { login } = useAuth();
  
  // Récupération des données transmises par le premier écran
  const { email, first_name, last_name } = useLocalSearchParams<{ 
    email: string; 
    first_name: string; 
    last_name: string 
  }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rules = [
  {
    label: "Au moins 12 caractères.",
    test: (pw: string) => pw.length >= 12,
  },
  {
    label: "Au moins une lettre en majuscule.",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "Au moins une lettre en minuscule.",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: "Au moins un chiffre.",
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    label: "Au moins un caractère spécial (# ? ! @ $ % ^ & * -).",
    test: (pw: string) => /[#?!@$%^&*-]/.test(pw),
  },
];

  const allValid = rules.every((rule) => rule.test(password));

  const handleRegister = async () => {
    if (!allValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Appel au service d'inscription
      await registerUser(
        first_name as string,
        last_name as string,
        email as string,
        password
      );

      // 2. Connexion automatique après succès
      await login(email as string, password);
      router.replace("/(main)/home")
      // Note: Le AuthContext redirigera l'utilisateur vers le home/app 
      // si votre layout est configuré pour écouter l'état 'user'.
    } catch (e: any) {
      console.error("Registration failed", e);
      Alert.alert("Erreur", "Impossible de créer le compte. L'email est peut-être déjà utilisé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
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
        <Text style={styles.title}>Sécurise ton compte</Text>

        <View style={styles.form}>
          <Input
            label="Mot de passe"
            placeholder="Ton mot de passe"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="new-password"
          />
        </View>

        <View style={styles.rulesContainer}>
          {rules.map((rule, idx) => {
            const valid = rule.test(password);
            return (
              <View key={idx} style={styles.ruleItem}>
                <Checkbox
                  value={valid}
                  color={valid ? Colors.vert : undefined}
                  style={{ marginRight: 12, width: 18, height: 18 }}
                  disabled
                />
                <Text style={{ color: valid ? Colors.noir : Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular }}>
                  {rule.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.form}>
          <Button
            label="Créer un compte"
            size="l"
            fullWidth
            disabled={!allValid}
            loading={isSubmitting}
            onPress={handleRegister}
          />
          <Button variant="tertiaire" label="Modifier mes informations" onPress={handleGoBack} />
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
    resizeMode: "contain",
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
  rulesContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: Colors.fond,
    padding: 16,
    borderRadius: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
});