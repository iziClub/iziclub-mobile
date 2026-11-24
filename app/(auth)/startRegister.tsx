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
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Button from "@/components/ui/Button";

export default function StartRegisterScreen() {
  const router = useRouter(); // <- hook pour naviguer
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateAccount = () => {
    router.replace("/register");
  };
  const handleLogin = () => {
    router.replace("/login");
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
          source={require("../../assets/illustrations/snowboard.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Le sport n'attend que toi !</Text>

        <Text style={styles.label}>Connecte-toi ou crée ton compte et découvre le sport près de chez toi</Text>

        <View style={[styles.actions, { marginTop: 40 }]}>
          <Button label="Créer un compte" size="l" fullWidth onPress={handleCreateAccount} />
          <Button label="J'ai déjà un compte" variant="secondaire" size="l" fullWidth onPress={handleLogin} />
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
    maxWidth: 280,
    height: 220,
    alignSelf: "center",
    marginVertical: 20,
    resizeMode: "contain",
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
    marginRight: 20,
    marginBottom: 8,
    color: Colors.grisTexte,
  },
  actions: {
    width: "90%",
    alignSelf: "center",
    gap: 12,
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
    backgroundColor: Colors.grisClair,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: Colors.grisTexte,
    fontFamily: Fonts.medium,
  },
});
