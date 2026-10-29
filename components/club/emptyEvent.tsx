import { View } from "react-native";
import React from "react";
import { Text, StyleSheet, Image } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

export default function EmptyEvents() {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/illustrations/tennis.png")}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
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
  illustration: {
    width: 140,
    height: 180,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.titre,
    color: Colors.noir,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    textAlign: 'center',
    lineHeight: 20,
  },
});