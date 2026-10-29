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
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { Fonts, Spacing } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(main)/home");
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgetPassword");
  };

  const handleCreateAccount = () => {
    router.push("/register");
  }

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
        <Text style={styles.title}>Connecte toi</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Entre ton adresse email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            placeholder="Ton mot de passe"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="password"
          />
          <Button
            variant="lien"
            label="Mot de passe oublié ?"
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          />
          <Button label="Connexion" size="l" fullWidth onPress={handleLogin} />
          <Button variant="tertiaire" label="Pas encore de compte ? S'inscrire" onPress={handleCreateAccount} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.blanc,
    paddingBottom: Spacing[5],
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
  },
  title: {
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1.28,
    fontFamily: Fonts.titre,
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[5],
    color: Colors.noir,
  },
  form: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[4],
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
});
