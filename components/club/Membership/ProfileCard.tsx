import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import Icon from "@/components/ui/Icon";

type Props = {
  user: any;
};

export default function ProfileCard({ user }: Props) {
  // console.info("Rendering ProfileCard with user:", user);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon
          name="person"
          size={20}
          color={Colors.noir}
        />
        <Text style={styles.cardTitle}>
          Tes informations (Profil)
        </Text>
      </View>

      <Text style={styles.infoText}>
        Prénom : {user?.firstName || "N/A"}
      </Text>

      <Text style={styles.infoText}>
        Nom : {user?.lastName || "N/A"}
      </Text>

      <Text style={styles.infoText}>
        Email : {user?.email || "N/A"}
      </Text>
    </View>
  );
}