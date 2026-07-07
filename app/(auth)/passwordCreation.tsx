import React, { useState } from "react";
import Checkbox from "expo-checkbox";
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
  ActivityIndicator,
  Alert
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { registerUser } from "../../services/auth";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rules = [
    { label: "Au moins 8 caractères.", test: (pw: string) => pw.length >= 8 },
    { label: "Au moins une lettre en majuscule.", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "Au moins une lettre en minuscule.", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "Au moins un chiffre.", test: (pw: string) => /\d/.test(pw) },
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

        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            placeholder="Ton mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rulesContainer}>
          {rules.map((rule, idx) => {
            const valid = rule.test(password);
            return (
              <View key={idx} style={styles.ruleItem}>
                <Checkbox
                  value={valid}
                  color={valid ? "#2E7D32" : undefined}
                  style={{ marginRight: 10, width: 18, height: 18 }}
                  disabled
                />
                <Text style={{ color: valid ? "#2E7D32" : "#999", fontSize: 14 }}>
                  {rule.label}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: allValid && !isSubmitting ? "#0E011A" : "#ccc" },
          ]}
          disabled={!allValid || isSubmitting}
          onPress={handleRegister}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Créer un compte</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.forgotPassword}>Modifier mes informations</Text>
        </TouchableOpacity>

        {/* <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>Ou</Text>
          <View style={styles.line} />
        </View> */}

        {/* <TouchableOpacity 
          style={[styles.button, styles.googleButton]}
          disabled={isSubmitting}
        >
          <Image
            source={require("../../assets/images/google-logo.png")}
            style={{ width: 20, height: 20, marginRight: 10 }}
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
    height: 350,
    resizeMode: "contain",
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
  rulesContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 30,
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 8,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#0E011A",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    marginBottom: 12,
    alignSelf: "center",
    height: 60,
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingRight: 10,
    marginBottom: 20,
    alignSelf: "center",
  },
  eyeButton: {
    paddingHorizontal: 8,
  },
  forgotPassword: {
    color: "#B8B4B1",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 12,
    textDecorationLine: "underline",
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
    backgroundColor: "#eee",
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
  }
});