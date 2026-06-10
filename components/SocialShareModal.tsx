import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  Share,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type ShareableItem = {
  type: "event" | "club";
  name: string;
  description?: string;
  location?: string;
  startTime?: string; // ISO string
  endTime?: string;   // ISO string
  price?: string;
  imageUrl?: string;  // bannière événement ou photo profil club
  tags?: string[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  item: ShareableItem;
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const APP_DOWNLOAD_LINK = "https://example.com/download"; // ← ton vrai lien
const DEFAULT_HASHTAGS = ["iziclub", "sport", "club"];

// ─────────────────────────────────────────────
// Message builders – un message riche par réseau
// ─────────────────────────────────────────────
const allTags = (item: ShareableItem): string[] => [
  ...DEFAULT_HASHTAGS,
  ...(item.tags ?? []).map((t) => t.toLowerCase().replace(/\s+/g, "")),
];

const hashtags = (item: ShareableItem) =>
  allTags(item)
    .map((h) => `#${h}`)
    .join(" ");

const formatTime = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h");
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

/**
 * Message Facebook/Instagram/natif : émojis, infos complètes, hashtags.
 */
function buildSocialMessage(item: ShareableItem): string {
  if (item.type === "club") {
    return (
      `🏆 ${item.name}\n\n` +
      (item.description
        ? `${item.description}\n\n`
        : `Rejoins ce club sur iziclub et suis tous ses événements !\n\n`) +
      `📲 Télécharge iziclub :\n${APP_DOWNLOAD_LINK}\n\n` +
      hashtags(item)
    );
  }

  // Événement
  let msg = `🎉 ${item.name}\n\n`;
  if (item.location) msg += `📍 ${item.location}\n`;
  if (item.startTime)
    msg += `🗓️ ${formatDate(item.startTime)} · ${formatTime(item.startTime)}${
      item.endTime ? ` – ${formatTime(item.endTime)}` : ""
    }\n`;
  if (item.price) msg += `💰 ${item.price}\n`;
  msg += `\nRetrouve cet événement et bien d'autres sur iziclub :\n${APP_DOWNLOAD_LINK}\n\n`;
  msg += hashtags(item);
  return msg;
}

/**
 * Message LinkedIn : ton professionnel, pas d'émojis excessifs, message long et structuré.
 */
function buildLinkedInMessage(item: ShareableItem): string {
  if (item.type === "club") {
    return (
      `Je vous présente ${item.name}, un club disponible sur iziclub.\n\n` +
      (item.description ? `${item.description}\n\n` : "") +
      `iziclub est la plateforme qui centralise les événements sportifs locaux et facilite ` +
      `l'accès aux clubs pour tous. Rejoignez la communauté :\n${APP_DOWNLOAD_LINK}\n\n` +
      allTags(item)
        .map((h) => `#${h}`)
        .join(" ")
    );
  }

  let msg = `Événement à ne pas manquer : ${item.name}\n\n`;
  if (item.location) msg += `Lieu : ${item.location}\n`;
  if (item.startTime)
    msg += `Date : ${formatDate(item.startTime)}${
      item.endTime
        ? `, de ${formatTime(item.startTime)} à ${formatTime(item.endTime)}`
        : ""
    }\n`;
  if (item.price) msg += `Tarif : ${item.price}\n`;
  msg += `\nDécouvrez cet événement et d'autres sur iziclub, la plateforme dédiée au sport local :\n${APP_DOWNLOAD_LINK}\n\n`;
  msg += allTags(item)
    .map((h) => `#${h}`)
    .join(" ");
  return msg;
}

// ─────────────────────────────────────────────
// Téléchargement de l'image en local
// ─────────────────────────────────────────────
async function downloadImageLocally(imageUrl: string): Promise<string | null> {
  try {
    const ext = imageUrl.split("?")[0].split(".").pop() ?? "jpg";
    const localPath = `${FileSystem.cacheDirectory}share_image.${ext}`;
    const { status } = await FileSystem.downloadAsync(imageUrl, localPath);
    if (status === 200) return localPath;
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Stratégies de partage par réseau
// ─────────────────────────────────────────────

/**
 * Instagram & Facebook app :
 * expo-sharing ouvre le sélecteur natif avec l'image.
 * L'utilisateur choisit Instagram/Facebook dans la liste native.
 * On copie le texte dans le presse-papiers pour qu'il puisse le coller.
 */
async function shareWithImage(item: ShareableItem, targetApp?: "instagram" | "facebook") {
  const message = buildSocialMessage(item);

  // 1. Copier le texte dans le presse-papiers
  await Clipboard.setStringAsync(message);

  // 2. Essayer de partager avec l'image si disponible
  if (item.imageUrl) {
    const localImage = await downloadImageLocally(item.imageUrl);
    if (localImage) {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        const appLabel = targetApp === "instagram" ? "Instagram" : "Facebook";
        Alert.alert(
          `Partager sur ${appLabel}`,
          "Le texte a été copié dans ton presse-papiers ✓\n\nL'image va s'ouvrir — sélectionne l'app et colle le texte dans ta publication.",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: `Ouvrir ${appLabel}`,
              onPress: () =>
                Sharing.shareAsync(localImage, {
                  mimeType: "image/jpeg",
                  dialogTitle: `Partager sur ${appLabel}`,
                  UTI: "public.jpeg",
                }),
            },
          ]
        );
        return;
      }
    }
  }

  // Fallback sans image : copier + ouvrir l'app directement
  const appUrl =
    targetApp === "instagram"
      ? "instagram://"
      : `fb://facewebmodal/f?href=${encodeURIComponent(APP_DOWNLOAD_LINK)}`;
  const webUrl =
    targetApp === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_DOWNLOAD_LINK)}`
      : undefined;

  const appLabel = targetApp === "instagram" ? "Instagram" : "Facebook";
  const canOpenApp = appUrl ? await Linking.canOpenURL(appUrl).catch(() => false) : false;

  Alert.alert(
    `Partager sur ${appLabel}`,
    "Le texte a été copié dans ton presse-papiers ✓\nColle-le dans ta publication !",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: `Ouvrir ${appLabel}`,
        onPress: () =>
          Linking.openURL(canOpenApp && appUrl ? appUrl : webUrl ?? APP_DOWNLOAD_LINK),
      },
    ]
  );
}

/**
 * LinkedIn :
 * On copie le message professionnel dans le presse-papiers
 * et on ouvre LinkedIn (app ou web). L'utilisateur colle le texte
 * dans une nouvelle publication — LinkedIn propose une UI riche
 * où il peut également ajouter l'image depuis sa galerie.
 */
async function shareToLinkedIn(item: ShareableItem) {
  const message = buildLinkedInMessage(item);

  // Copier dans le presse-papiers
  await Clipboard.setStringAsync(message);

  // Essayer d'ouvrir l'app LinkedIn, sinon le web
  const liAppUrl = "linkedin://";
  const liWebUrl = `https://www.linkedin.com/feed/?shareActive=true`;

  const canOpenApp = await Linking.canOpenURL(liAppUrl).catch(() => false);

  Alert.alert(
    "Partager sur LinkedIn",
    "Un message professionnel a été copié dans ton presse-papiers ✓\n\nOuvre LinkedIn, crée une nouvelle publication et colle le texte. Tu peux aussi y ajouter la photo du club directement depuis LinkedIn.",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Ouvrir LinkedIn",
        onPress: () => Linking.openURL(canOpenApp ? liAppUrl : liWebUrl),
      },
    ]
  );
}

/**
 * Partage natif (iOS share sheet / Android intent) :
 * inclut l'image si possible, le message complet, le lien.
 */
async function shareNative(item: ShareableItem) {
  const message = buildSocialMessage(item);

  if (item.imageUrl) {
    const localImage = await downloadImageLocally(item.imageUrl);
    if (localImage) {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(localImage, {
          mimeType: "image/jpeg",
          dialogTitle: item.name,
          UTI: "public.jpeg",
        });
        return;
      }
    }
  }

  // Fallback texte seul
  await Share.share(
    { message, url: item.imageUrl ?? APP_DOWNLOAD_LINK, title: item.name },
    { dialogTitle: item.name }
  );
}

// ─────────────────────────────────────────────
// Définition des options de partage
// ─────────────────────────────────────────────
type SocialOption = {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  onPress: (item: ShareableItem) => Promise<void>;
};

const SOCIAL_OPTIONS: SocialOption[] = [
  {
    key: "instagram",
    label: "Instagram",
    sublabel: "Image + texte",
    icon: <FontAwesome name="instagram" size={26} color="#fff" />,
    color: "#E1306C",
    onPress: (item) => shareWithImage(item, "instagram"),
  },
  {
    key: "facebook",
    label: "Facebook",
    sublabel: "Image + texte",
    icon: <FontAwesome name="facebook" size={26} color="#fff" />,
    color: "#1877F2",
    onPress: (item) => shareWithImage(item, "facebook"),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    sublabel: "Message pro",
    icon: <FontAwesome name="linkedin" size={26} color="#fff" />,
    color: "#0A66C2",
    onPress: shareToLinkedIn,
  },
  {
    key: "other",
    label: "Autre",
    sublabel: "Partage natif",
    icon: <Ionicons name="share-social-outline" size={26} color="#fff" />,
    color: "#444",
    onPress: shareNative,
  },
];

// ─────────────────────────────────────────────
// Composant modal (bottom sheet)
// ─────────────────────────────────────────────
export default function SocialShareModal({ visible, onClose, item }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePress = async (opt: SocialOption) => {
    onClose();
    setLoading(opt.key);
    await new Promise((r) => setTimeout(r, 350)); // laisser le modal se fermer
    try {
      await opt.onPress(item);
    } finally {
      setLoading(null);
    }
  };

  const tags = allTags(item).slice(0, 7);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Preview de l'item */}
        <View style={styles.preview}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.previewImage, styles.previewPlaceholder]}>
              <Ionicons
                name={item.type === "club" ? "shield-outline" : "calendar-outline"}
                size={24}
                color="#999"
              />
            </View>
          )}
          <View style={styles.previewText}>
            <Text style={styles.previewType}>
              {item.type === "club" ? "Club" : "Événement"}
            </Text>
            <Text style={styles.previewName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.startTime && (
              <Text style={styles.previewMeta}>
                {formatDate(item.startTime)}
              </Text>
            )}
            {item.location && (
              <Text style={styles.previewMeta} numberOfLines={1}>
                📍 {item.location}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Ionicons name="close" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Hashtags */}
        <View style={styles.hashtagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.hashtagPill}>
              <Text style={styles.hashtagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Partager sur</Text>

        {/* Boutons réseaux */}
        <View style={styles.socialRow}>
          {SOCIAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.socialItem}
              onPress={() => handlePress(opt)}
              disabled={loading !== null}
            >
              <View style={[styles.socialIcon, { backgroundColor: opt.color }]}>
                {loading === opt.key ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  opt.icon
                )}
              </View>
              <Text style={styles.socialLabel}>{opt.label}</Text>
              <Text style={styles.socialSub}>{opt.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info presse-papiers */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#1C52D2" />
          <Text style={styles.infoText}>
            Le message sera copié dans ton presse-papiers pour que tu puisses le coller facilement.
          </Text>
        </View>

        <View style={{ height: Platform.OS === "ios" ? 28 : 16 }} />
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 14,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  // ── Preview ──
  preview: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    flexShrink: 0,
  },
  previewPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewType: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1C52D2",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  previewName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0E011A",
    lineHeight: 20,
  },
  previewMeta: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 14,
  },
  // ── Hashtags ──
  hashtagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 18,
  },
  hashtagPill: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D6E0FF",
  },
  hashtagText: {
    fontSize: 12,
    color: "#1C52D2",
    fontWeight: "600",
  },
  // ── Social ──
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AAA",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  socialItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  socialIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#222",
  },
  socialSub: {
    fontSize: 10,
    color: "#999",
    fontWeight: "500",
  },
  // ── Info box ──
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F4FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#444",
    lineHeight: 17,
  },
});