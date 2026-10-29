import React from "react";
import {
  View,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

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

      <Button
        label="Se connecter / S'inscrire"
        size="l"
        onPress={() => router.push("/login")}
        style={styles.loginButton}
      />
    </View>
  );
}