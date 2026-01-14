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
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function StartRegisterScreen() {
  const router = useRouter(); // <- hook pour naviguer
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateAccount = () => {
    router.push("/(auth)/register");
  };
  const handleLogin = () => {
    router.push("/(auth)/login");
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
        <Text style={styles.title}>Le sport n'attend que toi !</Text>

        <Text style={styles.label}>Connecte-toi ou crée ton compte et découvre le sport près de chez toi</Text>

        <TouchableOpacity
          style={[styles.button, { marginTop: 40 }]}
          onPress={handleCreateAccount}
        >
          <Text style={styles.buttonText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#ECEAE8" }]} onPress={handleLogin}>
          <Text style={[styles.buttonText, { color: "#0E011A" }]}>J'ai déjà un compte</Text>
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
    marginRight: 20,
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
