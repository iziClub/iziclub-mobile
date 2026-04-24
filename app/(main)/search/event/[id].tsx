import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as Calendar from "expo-calendar";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from "expo-sharing";
import { Share } from "react-native";
import { Event } from "@/types/event";
import { getClubById } from "@/services/clubs.service";
import { getEventById } from "@/services/events.service";
import { Club } from "@/types/club";
import { mapClubToSearchItem } from "@/mappers/club.mapper";

// type Event = {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   location: string;
//   price: string;
//   tags: string[];
//   club: {
//     id: string;
//     name: string;
//     image?: string;
//   }
// };

async function shareItem(item: {
  name: string;
  type: string;
  location?: string;
  image?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  price?: string;
}) {
  try {
    const appLink = "https://example.com/download";
    const hashtags = "#club #sport #iziclub";

    let message = `${item.type} : ${item.name}\n`;
    if (item.location) message += `📍 ${item.location}\n`;
    if (item.date && item.startTime && item.endTime) message += `🗓️ ${item.date} ${item.startTime} - ${item.endTime}\n`;
    if (item.price) message += `💰 ${item.price}\n`;
    message += `Partagé depuis Iziclub ! ${appLink}\n${hashtags}`;

    await Share.share({
      message: message,
      url: item.image, // iOS utilise ça
      title: item.name,
    });

  } catch (error) {
    console.error(error);
    Alert.alert("Erreur", "Impossible de partager cet événement");
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
      startDate: new Date(`${event.starts_at}`),
      endDate: new Date(`${event.ends_at}`),
      location: `${event.address.city}, ${event.address.street}`,
      notes: event.description,
    });

    Alert.alert("Succès", "Événement ajouté au calendrier !");
  } catch (err) {
    console.error(err);
    Alert.alert("Erreur", "Impossible d'ajouter l'événement");
  }
}

const formatDateReadable = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
};

const formatTimeReadable = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).replace(':', 'h');
};

function confirmAddToCalendar(event: Event) {
  // Préparation des strings formatées
  const dateEvent = formatDateReadable(event.starts_at || "");
  const heureDebut = formatTimeReadable(event.starts_at || "");
  const heureFin = formatTimeReadable(event.ends_at || "");

  Alert.alert(
    "Ajouter au calendrier",
    `📅 ${event.name}\n\n` +
    `🗓️ Le ${dateEvent}\n` +
    `⏰ de ${heureDebut} à ${heureFin}\n` +
    `📍 ${event.address.city}, ${event.address.street}`,
    [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Ajouter", 
        onPress: () => addToCalendar(event),
        style: "default" 
      },
    ],
    { cancelable: true }
  );
}
const formatEventTime = (dateString: string | null) => {
  if (!dateString) return "--h--";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(':', 'h'); // Transforme 13:00 en 13h00
};

const formatEventDate = (dateString: string | null) => {
  if (!dateString) return "Date à définir";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(date); // Exemple: "16 avril"
};

// -------------------
// Composant principal
// -------------------
export default function EventDetailScreen() {
  const params = useGlobalSearchParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const router = useRouter();
  // const event: Event = {
  //   id: eventId,
  //   name: "Coupe de Moselle CSG vs AS TALANGE",
  //   description:
  //     "Un choc local à ne pas manquer : le CSG reçoit l'AS Talange pour un duel décisif en Coupe de Moselle. Venez vibrer et soutenir votre équipe dans cette course vers la qualification !",
  //   image:
  //     "https://www.toutchalons.com/images/evenement/16661/affiche/original/FB_IMG_1747667688049.webp",
  //   date: "2026-03-11",
  //   startTime: "10:00",
  //   endTime: "12:00",
  //   location: "123 Rue Principale, Québec, QC, Canada",
  //   price: "10€",
  //   tags: ["Football", "Tournoi", "U18"],
  //   club: {
  //     id: "1",
  //     name: "Club Sportif de Gravelotte",
  //     image: "https://picsum.photos/seed/avatar1/100",
  //   }
  // };

  const [club, setClub] = useState<Club | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      // console.log("Event ID pour fetch club:", event);
      if (event?.club_id) {
        const clubData = await getClubById(event.club_id);
        setClub(clubData);
      }
    };

    fetchClub();
  }, [event?.club_id]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (!event) {
    return (
      <View>
        <ActivityIndicator size="large" color="#4A78FF" />
      </View>
    );
  }

  console.log("Données de l'événement récupérées:", event);
  return (
    <ScrollView style={styles.container}>
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.banner_url ?? "https://meetings.quebec-cite.com/sites/qda/files/styles/landscape_wide_desktop/public/media/image/%C2%A9James-Startt--peloton-frontenac02_GP-quebec_2018-%281-of-1%29.jpg?h=e397a55a&itok=K1A0H_pt" }} style={styles.image} resizeMode="cover" />
      </View>

      {/* TITRE */}
      <Text style={styles.title}>{event.name}</Text>

      {/* TAGS */}
      {event.tags && event.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {event.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.clubContainer}
        onPress={() => router.push(`/search/club/${event.club_id}`)}
      >
        {club?.profile_image_url && (
          <Image source={{ uri: club.profile_image_url }} style={styles.clubImage} />
        )}
        <Text style={styles.clubName}>Publié par {club?.name}</Text>
      </TouchableOpacity>
      {/* DESCRIPTION */}
      {event.description && (
        <Text style={styles.description}>{event.description}</Text>
      )}

      {/* INFOS */}
      <View style={styles.infoBlock}>
        {/* DATE */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={22} color="#0E011A" />
          <Text style={{...styles.infoText, flex: 0}}>
            Le {formatEventDate(event.starts_at)}
          </Text>
          <Text style={styles.infoText}>
            {formatEventTime(event.starts_at)} - {formatEventTime(event.ends_at)}
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
        {event.address.city && event.address.street ? (
  <View style={styles.infoRow}>
    <Ionicons name="location-outline" size={22} color="#0E011A" />
    <Text style={styles.infoText}>
      {event.address.street}, {event.address.city}
    </Text>
  </View>
) : (
  <View style={styles.infoRow}>
    <Ionicons name="location-outline" size={22} color="#0E011A" />
    <Text style={{...styles.infoText, fontStyle: "italic", color: "#666" }}>
      Adresse non communiquée pour le moment
    </Text>
  </View>
)}

        {/* PRIX */}
        <View style={styles.infoRow}>
          <FontAwesome name="eur" size={22} color="#0E011A" />
          <Text style={styles.infoText}>{event.pricing ?? "Non précisé"}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.calendarButton, {
          backgroundColor: "#28a745", justifyContent: "center", marginHorizontal: 16,
          marginTop: 20,
          paddingVertical: 16,
          paddingHorizontal: 12,
          borderRadius: 12
        }]}
        onPress={() =>
          shareItem({
            name: event.name,
            type: "Événement",
            location: `${event.address.street}, ${event.address.city}`,
            image: event.imageUrl,
            startTime: event.starts_at ?? undefined,
            endTime: event.ends_at ?? undefined,
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