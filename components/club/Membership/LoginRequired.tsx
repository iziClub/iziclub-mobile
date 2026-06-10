import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "./styles";

export default function LoginRequired() {
  const router = useRouter();

  return (
    <View style={styles.centeredContainer}>
      <Ionicons
        name="lock-closed"
        size={64}
        color="#ccc"
      />

      <Text style={styles.lockTitle}>
        Connecte-toi pour rejoindre le club
      </Text>

      <Text style={styles.lockSubtitle}>
        Tu dois avoir un compte Iziclub pour envoyer
        ton dossier d'inscription.
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginButtonText}>
          Se connecter / S'inscrire
        </Text>
      </TouchableOpacity>
    </View>
  );
}