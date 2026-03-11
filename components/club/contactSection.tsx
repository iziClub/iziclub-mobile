import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";

interface Club {
  name: string;
  addressLine1: string;
  city: string;
  phone?: string;
  email?: string;
  instagram?: string; // lien vers le profil Insta
    facebook?: string; // lien vers le profil Facebook
}

export default function ContactSection({ club }: { club: Club }) {
  const fullAddress = `${club.addressLine1}, ${club.city}`;
  const phoneNumber = club.phone || "0123456789";
  const emailAddress = club.email || `contact@${club.name.toLowerCase().replace(/\s/g, "")}.com`;
  const instagramUrl = club.instagram || "https://www.instagram.com/";
  const facebookUrl = club.facebook || "https://www.facebook.com/";

  const openMaps = async () => {
    const query = encodeURIComponent(fullAddress);
    const wazeUrl = `waze://?q=${query}&navigate=yes`;
    const googleUrl = Platform.select({
      ios: `http://maps.apple.com/?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });

    try {
      const supported = await Linking.canOpenURL(wazeUrl);
      if (supported) {
        Linking.openURL(wazeUrl);
      } else {
        Linking.openURL(googleUrl!);
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application de navigation.");
    }
  };

  const callPhone = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${emailAddress}`);
  };

  const openInstagram = () => {
    Linking.openURL(instagramUrl);
  };

  return (
    <View style={styles.container}>
      {/* Adresse */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adresse</Text>
        <TouchableOpacity onPress={openMaps}>
          <Text style={styles.linkText}>{fullAddress}</Text>
        </TouchableOpacity>
      </View>

      {/* Téléphone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Téléphone</Text>
        <TouchableOpacity onPress={callPhone}>
          <Text style={styles.linkText}>{phoneNumber}</Text>
        </TouchableOpacity>
      </View>

      {/* Email */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <TouchableOpacity onPress={sendEmail}>
          <Text style={styles.linkText}>{emailAddress}</Text>
        </TouchableOpacity>
      </View>

      {/* Instagram */}
      <View style={styles.section}>
        <TouchableOpacity style={[styles.instagramButton, { marginBottom: 12 }]} onPress={openInstagram}>
          <FontAwesome name="instagram" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.instagramText}>Suivez-nous sur Instagram</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity style={[styles.instagramButton, { backgroundColor: "#3b5998" }]} onPress={() => Linking.openURL(facebookUrl)}>
          <FontAwesome name="facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.instagramText}>Suivez-nous sur Facebook</Text>
        </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  instagramButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1306C",
    paddingVertical: 12,
    borderRadius: 10,
  },
  instagramText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});