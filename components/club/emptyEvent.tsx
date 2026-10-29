import { View } from "react-native";
import React from "react";
import { Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "@/constants/colors";

export default function EmptyEvents() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="calendar-outline" size={40} color={Colors.bleu} />
      </View>
      <Text style={styles.emptyTitle}>Aucun événement trouvé</Text>
    <Text style={styles.emptySubtitle}>
      Il n'y a rien ici pour le moment.
    </Text>
  </View>
);}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.bleuClair,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.noir,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gris,
    textAlign: 'center',
    lineHeight: 20,
  },
});