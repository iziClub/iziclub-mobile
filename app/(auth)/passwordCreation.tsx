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
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function PasswordCreationScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const rules = [
    { label: "Au moins 8 caractères.", test: (pw: string | any[]) => pw.length >= 8 },
    { label: "Au moins une lettre en majuscule.", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "Au moins une lettre en minuscule.", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "Au moins un chiffre.", test: (pw: string) => /\d/.test(pw) },
  ];
  const allValid = rules.every((rule) => rule.test(password));
  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleForgotPassword = () => {
    alert("Redirection vers mot de passe oublié !");
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
            <Text>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rulesContainer}>
          {rules.map((rule, idx) => {
            const valid = rule.test(password);
            return (
              <View key={idx} style={styles.ruleItem}>
                <Checkbox
                  value={valid}
                  color={valid ? "green" : undefined}
                  style={{ marginRight: 8 }}
                  disabled
                />
                <Text style={{ color: valid ? "green" : "gray" }}>{rule.label}</Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: allValid ? "#0E011A" : "#ccc" },
          ]}
          disabled={!allValid}
          onPress={() => console.log("Compte créé")}
        >
          <Text style={styles.buttonText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>J'ai déjà mon compte</Text>
        </TouchableOpacity>
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>Ou</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#F7F6F5", flexDirection: "row", alignItems: "center", justifyContent: "center" }]}>
          <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/800px-Google_Favicon_2025.svg.png" }}
          />
          <Image
            source={require("../../assets/images/google-logo.png")}
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
          <Text style={[styles.buttonText, { color: "black" }]}>
            Se connecter avec Google
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
    marginBottom: 20,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingRight: 10,
    marginBottom: 12,
    alignSelf: "center",
  },
  eyeButton: {
    paddingHorizontal: 8,
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
});
