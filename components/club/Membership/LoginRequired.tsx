import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import Icon from "@/components/ui/Icon";

export default function LoginRequired() {
  const router = useRouter();

  return (
    <View style={styles.centeredContainer}>
      <Icon
        name="lock-closed"
        size={64}
        color={Colors.gris}
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