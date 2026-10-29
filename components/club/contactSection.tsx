import React from "react";
import { View, Text, StyleSheet, Platform, Alert } from "react-native";
import * as Linking from "expo-linking";
import { Club } from "@/types/club";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Button from "@/components/ui/Button";

const safeTrim = (value?: string | null) => (value || "").trim();

const ensureUrl = (url?: string, fallback?: string) => {
  const raw = safeTrim(url);
  if (!raw) return fallback || "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
};

const openExternalUrl = async (url: string) => {
  try {
    if (!url) return;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Lien indisponible", "Impossible d'ouvrir ce lien pour le moment.");
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Erreur", "Impossible d'ouvrir ce lien.");
  }
};

export default function ContactSection({ club }: { club: Club }) {
  const addressStreet = safeTrim(club.profile?.address?.street) || safeTrim(club.addressLine1) || "Adresse non renseignée";
  const addressCity = safeTrim(club.profile?.address?.city) || safeTrim(club.city) || "Ville non renseignée";
  const fullAddress = `${addressStreet}, ${addressCity}`;

  const latitude = Number(club.profile?.address?.latitude);
  const longitude = Number(club.profile?.address?.longitude);
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

  const normalizedClubName = safeTrim(club.name).toLowerCase().replace(/\s+/g, "") || "club";
  const phoneNumber = safeTrim(club.profile?.phone) || "Numero non renseigne";
  const emailAddress = safeTrim(club.profile?.email) || `contact@${normalizedClubName}.com`;
  const instagramValue = safeTrim(club.profile?.socialLinks?.instagram);
  const facebookValue = safeTrim(club.profile?.socialLinks?.facebook);
  const linkedinValue = safeTrim(club.profile?.socialLinks?.linkedin);
  const tiktokValue = safeTrim(club.profile?.socialLinks?.tiktok);
  const instagramUrl = instagramValue ? ensureUrl(instagramValue) : "";
  const facebookUrl = facebookValue ? ensureUrl(facebookValue) : "";
  const linkedinUrl = linkedinValue ? ensureUrl(linkedinValue) : "";
  const tiktokUrl = tiktokValue ? ensureUrl(tiktokValue) : "";

  const categoriesLabel = (club.categories || []).slice(0, 4).map((c) => c.name).join(" • ") || "Aucune catégorie renseignée";
  const eventsCount = club.events?.length || 0;
  const sessionsCount = club.sessions?.length || 0;
  const distanceText = typeof club.distanceInKm === "number" ? `${club.distanceInKm.toFixed(1)} km` : "Distance non disponible";

  const openMaps = async () => {
    const query = encodeURIComponent(fullAddress);
    const wazeUrl = hasCoords
      ? `waze://?ll=${latitude},${longitude}&navigate=yes`
      : `waze://?q=${query}&navigate=yes`;

    const fallbackUrl = hasCoords
      ? Platform.select({
          ios: `http://maps.apple.com/?ll=${latitude},${longitude}&q=${query}`,
          android: `geo:${latitude},${longitude}?q=${query}`,
          default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        })
      : Platform.select({
          ios: `http://maps.apple.com/?q=${query}`,
          android: `geo:0,0?q=${query}`,
          default: `https://www.google.com/maps/search/?api=1&query=${query}`,
        });

    try {
      const supported = await Linking.canOpenURL(wazeUrl);
      if (supported) {
        await Linking.openURL(wazeUrl);
      } else if (fallbackUrl) {
        await Linking.openURL(fallbackUrl);
      }
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application de navigation.");
    }
  };

  const callPhone = () => {
    if (phoneNumber === "Numero non renseigne") return;
    openExternalUrl(`tel:${phoneNumber}`);
  };

  const sendEmail = () => {
    openExternalUrl(`mailto:${emailAddress}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Coordonnees du club</Text>
        <Text style={styles.subtitle}>{club.name}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{eventsCount}</Text>
            <Text style={styles.statLabel}>Evenements</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{sessionsCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{distanceText}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Adresse</Text>
          <Button variant="lien" icon="map-marker" label={fullAddress} onPress={openMaps} style={styles.linkRow} />
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Telephone</Text>
          <Button variant="lien" icon="phone" label={phoneNumber} onPress={callPhone} style={styles.linkRow} />
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Email</Text>
          <Button variant="lien" icon="envelope" label={emailAddress} onPress={sendEmail} style={styles.linkRow} />
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Categories</Text>
          <Text style={styles.infoText}>{categoriesLabel}</Text>
        </View>

        <View style={styles.socialRow}>
          <Button
            icon="instagram"
            label={instagramUrl ? "Instagram" : "Non renseigné"}
            onPress={() => openExternalUrl(instagramUrl)}
            disabled={!instagramUrl}
            style={styles.socialButton}
          />

          <Button
            icon="facebook"
            label={facebookUrl ? "Facebook" : "Non renseigné"}
            onPress={() => openExternalUrl(facebookUrl)}
            disabled={!facebookUrl}
            style={styles.socialButton}
          />
        </View>

        <View style={styles.socialRow}>
          <Button
            icon="linkedin"
            label={linkedinUrl ? "LinkedIn" : "Non renseigné"}
            onPress={() => openExternalUrl(linkedinUrl)}
            disabled={!linkedinUrl}
            style={styles.socialButton}
          />

          <Button
            icon="music"
            label={tiktokUrl ? "TikTok" : "Non renseigné"}
            onPress={() => openExternalUrl(tiktokUrl)}
            disabled={!tiktokUrl}
            style={styles.socialButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.fond,
  },
  card: {
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.titre,
    color: Colors.noir,
  },
  subtitle: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.bleuClair,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.bleu,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.bleu,
    marginTop: 2,
    fontFamily: Fonts.medium,
  },
  infoBlock: {
    borderTopWidth: 1,
    borderTopColor: Colors.grisClair,
    paddingTop: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.grisTexte,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  linkRow: {
    alignSelf: "flex-start",
  },
  infoText: {
    fontSize: 16, fontFamily: Fonts.regular,
    lineHeight: 22,
    color: Colors.noir,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  socialButton: {
    flex: 1,
  },
});