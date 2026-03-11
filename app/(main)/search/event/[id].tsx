import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as Calendar from "expo-calendar";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from "expo-sharing";

type Event = {
  id: string;
  name: string;
  description: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  price: string;
  tags: string[];
  club: {
  id: string;
  name: string;
  image?: string;
}
};

// -------------------
// Partage
// -------------------
async function shareItem(item: {
  name: string;
  type: string; // "Club" ou "Événement"
  location?: string;
  image?: string; // URL de l'image
}) {
  try {
    const appLink = "https://example.com/download"; // lien vers l'app
    const hashtags = "#club #sport #iziclub";

    let message = `${item.type} : ${item.name}\n`;
    if (item.location) message += `📍 ${item.location}\n`;
    message += `Rejoignez-nous sur Iziclub ! ${appLink}\n${hashtags}`;

    // Vérifie si le partage est disponible
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(
        "Partage non disponible",
        "Le partage n'est pas disponible sur cet appareil"
      );
      return;
    }

    if (item.image) {
      // Télécharge l'image dans le cache
      const fileUri =
        FileSystem.cacheDirectory +
        item.name.replace(/\s/g, "_").toLowerCase() +
        ".jpg";
      const download = await FileSystem.downloadAsync(item.image, fileUri);

      // Partage image + message
      await Sharing.shareAsync(download.uri, {
        mimeType: "image/jpeg",
        dialogTitle: `Partager ${item.name}`,
        UTI: "public.jpeg",
      });
    } else {
      // Partage texte seul via fichier temporaire
      const fileUri = FileSystem.cacheDirectory + "message.txt";
      await FileSystem.writeAsStringAsync(fileUri, message, {
  encoding: "utf8", // ✅ ok pour la version actuelle
});

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/plain",
        dialogTitle: `Partager ${item.name}`,
        UTI: "public.plain-text",
      });
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Erreur", "Impossible de partager cet item.");
  }
}

// -------------------
// Calendrier
// -------------------
async function getCalendarPermission() {
  const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
  let remindersStatus = "granted";

  if (Platform.OS === "ios") {
    const reminders = await Calendar.requestRemindersPermissionsAsync();
    remindersStatus = reminders.status;
  }

  return calendarStatus === "granted" && remindersStatus === "granted";
}

async function addToCalendar(event: Event) {
  try {
    const hasPermission = await getCalendarPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission refusée",
        "Impossible d'accéder au calendrier ou aux rappels"
      );
      return;
    }

    let defaultCalendarId: string | undefined;

    if (Platform.OS === "ios") {
      const calendars = await Calendar.getCalendarsAsync();
      const cal = calendars.find((c) => c.allowsModifications);
      defaultCalendarId = cal?.id;
    } else {
      const cal = await Calendar.getDefaultCalendarAsync();
      defaultCalendarId = (cal as any)?.id;
    }

    if (!defaultCalendarId) {
      Alert.alert("Erreur", "Aucun calendrier disponible");
      return;
    }

    await Calendar.createEventAsync(defaultCalendarId, {
      title: event.name,
      startDate: new Date(`${event.date}T${event.startTime}`),
      endDate: new Date(`${event.date}T${event.endTime}`),
      location: event.location,
      notes: event.description,
    });

    Alert.alert("Succès", "Événement ajouté au calendrier !");
  } catch (err) {
    console.error(err);
    Alert.alert("Erreur", "Impossible d'ajouter l'événement");
  }
}

function confirmAddToCalendar(event: Event) {
  Alert.alert(
    "Ajouter au calendrier",
    `Nom : ${event.name}\nDate : ${event.date}\nHeure : ${event.startTime} - ${event.endTime}\nLieu : ${event.location}`,
    [
      { text: "Annuler", style: "cancel" },
      { text: "Ajouter", onPress: () => addToCalendar(event) },
    ],
    { cancelable: true }
  );
}

// -------------------
// Composant principal
// -------------------
export default function EventDetailScreen() {
  const params = useGlobalSearchParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();
  const event: Event = {
    id: eventId,
    name: "Coupe de Moselle CSG vs AS TALANGE",
    description:
      "Un choc local à ne pas manquer : le CSG reçoit l'AS Talange pour un duel décisif en Coupe de Moselle. Venez vibrer et soutenir votre équipe dans cette course vers la qualification !",
    image:
      "https://www.toutchalons.com/images/evenement/16661/affiche/original/FB_IMG_1747667688049.webp",
    date: "2026-03-11",
    startTime: "10:00",
    endTime: "12:00",
    location: "123 Rue Principale, Québec, QC, Canada",
    price: "10€",
    tags: ["Football", "Tournoi", "U18"],
    club: {
      id: "1",
      name: "Club Sportif de Gravelotte",
      image: "https://picsum.photos/seed/avatar1/100",
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />
      </View>

      {/* TITRE */}
      <Text style={styles.title}>{event.name}</Text>

      {/* TAGS */}
      <View style={styles.tagContainer}>
        {event.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
// Après les TAGS, avant DESCRIPTION
<TouchableOpacity
  style={styles.clubContainer}
  onPress={() => router.push(`/search/club/${event.club.id}`)}
>
  {event.club.image && (
    <Image source={{ uri: event.club.image }} style={styles.clubImage} />
  )}
  <Text style={styles.clubName}>Publié par {event.club.name}</Text>
</TouchableOpacity>
      {/* DESCRIPTION */}
      <Text style={styles.description}>{event.description}</Text>

      {/* INFOS */}
      <View style={styles.infoBlock}>
        {/* DATE */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={22} color="#0E011A" />
          <Text style={styles.infoText}>
            {event.date} • {event.startTime} - {event.endTime}
          </Text>

          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => confirmAddToCalendar(event)}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text style={styles.calendarButtonText}>Ajouter</Text>
          </TouchableOpacity>

          
        </View>

        {/* LOCALISATION */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={22} color="#0E011A" />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>

        {/* PRIX */}
        <View style={styles.infoRow}>
          <FontAwesome name="eur" size={22} color="#0E011A" />
          <Text style={styles.infoText}>{event.price}</Text>
        </View>
      </View>
        <TouchableOpacity
            style={[styles.calendarButton, { backgroundColor: "#28a745", justifyContent: "center", marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12 }]}
            onPress={() =>
              shareItem({
                name: event.name,
                type: "Événement",
                location: event.location,
                image: event.image,
              })
            }
          >
            <Ionicons name="share-social-outline" size={20} color="white" />
            <Text style={styles.calendarButtonText}>Partager</Text>
          </TouchableOpacity>
    </ScrollView>
  );
}

// -------------------
// STYLES
// -------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imageContainer: {
    width: "100%",
    height: 220,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginHorizontal: 16,
    color: "#0E011A",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#1C52D2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 8,
    color: "#555",
    lineHeight: 22,
  },
  infoBlock: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#0E011A",
    flex: 1,
    flexWrap: "wrap",
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C52D2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  calendarButtonText: {
    color: "white",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "600",
  },
  clubContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginHorizontal: 16,
  marginTop: 8,
  paddingVertical: 6,
},
clubImage: {
  width: 36,
  height: 36,
  borderRadius: 18,
  marginRight: 8,
},
clubName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#0E011A",
},
});