import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./styles";

type Props = {
  user: any;
};

export default function ProfileCard({ user }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons
          name="person"
          size={20}
          color="#0E011A"
        />
        <Text style={styles.cardTitle}>
          Tes informations (Profil)
        </Text>
      </View>

      <Text style={styles.infoText}>
        Prénom : {user?.user?.first_name || "N/A"}
      </Text>

      <Text style={styles.infoText}>
        Nom : {user?.user?.last_name || "N/A"}
      </Text>

      <Text style={styles.infoText}>
        Email : {user?.user?.email || "N/A"}
      </Text>

      <TouchableOpacity style={styles.editProfile}>
        <Text style={styles.editProfileText}>
          Modifier dans mon profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}