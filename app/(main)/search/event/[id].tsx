import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
  Share,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as Calendar from "expo-calendar";
import { Event } from "@/types/event";
import { getClubById } from "@/services/clubs.service";
import { getEventById, getEventsLikeCount, getEventStatus } from "@/services/events.service";
import { Club } from "@/types/club";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import EngagementBar from "@/components/EngagementBar";
import { useAuth } from "@/context/AuthContext";
import { styles } from "./_styles";

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
      startDate: new Date(`${event.startDate}`),
      endDate: new Date(`${event.endDate}`),
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
  const dateEvent = formatDateReadable(event.eventDate || "");
  const heureDebut = formatTimeReadable(event.startDate || "");
  const heureFin = formatTimeReadable(event.endDate || "");

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

const openNavigation = (street: string, city: string) => {
  const address = `${street}, ${city}`;
  const url = Platform.select({
    ios: `maps:0,0?q=${address}`,
    android: `geo:0,0?q=${address}`,
  });

  if (url) {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application de navigation");
      }
    });
  }
};

// -------------------
// Composant principal
// -------------------
export default function EventDetailScreen() {
  const params = useGlobalSearchParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [club, setClub] = useState<Club | null>(null);
  const regionFake = {
    latitude: 49.1191, // Exemple: Metz
    longitude: 6.1727,
    latitudeDelta: 0.001,
    longitudeDelta: 0.05,
  };
  const [region, setRegion] = useState(regionFake);

  useEffect(() => {
    const fetchClub = async () => {
      if (event?.clubId) {
        const clubData = await getClubById(event.clubId);
        setClub(clubData.data[0]);
      }
    };

    fetchClub();
  }, [event?.clubId]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        const eventData = await getEventById(eventId);
        if (isLoggedIn) {
          const eventStatus = await getEventStatus(eventId);
          eventData.status = eventStatus;
          const eventLikeCount = await getEventsLikeCount(eventId);
          eventData.status.countLikes = eventLikeCount;
        } else {
          eventData.status = {};
        }

        setEvent(eventData);
        const newRegion = { ...regionFake };
        newRegion.latitude = parseFloat(eventData?.address.latitude || "49.1191");
        newRegion.longitude = parseFloat(eventData?.address.longitude || "6.1727");

        setRegion(newRegion);
      }
    };

    fetchEvent();
  }, [eventId, isLoggedIn]);

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ height: 260, backgroundColor: '#E5E7EB' }} />
        <View style={{ padding: 20 }}>
          <View style={{ height: 24, width: '70%', borderRadius: 12, backgroundColor: '#E5E7EB', marginBottom: 16 }} />
          <View style={{ height: 16, width: '40%', borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 20 }} />
          <View style={{ height: 12, width: '95%', borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 10 }} />
          <View style={{ height: 12, width: '90%', borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 10 }} />
          <View style={{ height: 12, width: '85%', borderRadius: 10, backgroundColor: '#E5E7EB', marginBottom: 24 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ height: 44, width: '48%', borderRadius: 14, backgroundColor: '#E5E7EB' }} />
            <View style={{ height: 44, width: '48%', borderRadius: 14, backgroundColor: '#E5E7EB' }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* IMAGE */}
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.banner_url ?? "https://meetings.quebec-cite.com/sites/qda/files/styles/landscape_wide_desktop/public/media/image/%C2%A9James-Startt--peloton-frontenac02_GP-quebec_2018-%281-of-1%29.jpg?h=e397a55a&itok=K1A0H_pt" }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/search');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0E011A" />
        </TouchableOpacity>
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
        onPress={() => router.push(`/search/club/${event.clubId}`)}
      >
        {club?.profile.profileImagePath != undefined && (
          <Image source={{ uri: club.profile.profileImagePath }} style={styles.clubImage} />
        )}
        <Text style={styles.clubName}>Publié par {club?.name}</Text>
      </TouchableOpacity>

      {event.partnerClubs && event.partnerClubs.length > 0 && (
        <View style={styles.partnerSection}>
          <Text style={styles.partnerTitle}>Clubs partenaires</Text>
          {event.partnerClubs.map((partner) => (
            <TouchableOpacity
              key={partner.id}
              style={styles.partnerChip}
              onPress={() => router.push(`/search/club/${partner.id}`)}
            >
              {partner.profileImagePath ? (
                <Image source={{ uri: partner.profileImagePath }} style={styles.partnerImage} />
              ) : null}
              <Text style={styles.partnerName}>{partner.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* DESCRIPTION */}
      {event.description && (
        <Text style={styles.description}>{event.description}</Text>
      )}

      {/* INFOS */}
      <View style={styles.infoBlock}>
        {/* DATE */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={22} color="#0E011A" />
          <Text style={{ ...styles.infoText, flex: 0 }}>
            Le {formatEventDate(event.eventDate)}
          </Text>
          <Text style={styles.infoText}>
            {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
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
          <>
            <View style={[styles.infoRow, { marginBottom: 10 }]}>
              <Ionicons name="location-outline" size={22} color="#0E011A" />
              <Text style={styles.infoText}>
                {event.address.street}, {event.address.city}
              </Text>
            </View>

            {/* LA CARTE */}
            <View style={styles.mapWrapper}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
                scrollEnabled={false} // On bloque pour éviter les conflits avec le ScrollView
                zoomEnabled={false}
                onPress={() => openNavigation(event.address.street, event.address.city)}
              >
                <Marker coordinate={region} pinColor="#1C52D2" />
              </MapView>

              {/* BOUTON ITINÉRAIRE SUR LA CARTE */}
              <TouchableOpacity
                style={styles.navOverlayButton}
                onPress={() => openNavigation(event.address.street, event.address.city)}
              >
                <Ionicons name="navigate" size={18} color="white" />
                <Text style={styles.navOverlayText}>Y aller</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={22} color="#0E011A" />
            <Text style={{ ...styles.infoText, fontStyle: "italic", color: "#666" }}>
              Adresse non communiquée
            </Text>
          </View>
        )}

        {/* PRIX */}
        <View style={styles.infoRow}>
          <FontAwesome name="eur" size={22} color="#0E011A" />
          <Text style={styles.infoText}>{event.price ?? "Non précisé"}</Text>
        </View>
      </View>

      <EngagementBar
        item={{ id: event.id, kind: "event", name: event.name, imageUrl: event.banner_url }}
        initialLiked={isLoggedIn ? (event.status?.isLiked ?? false) : false}
        initialSaved={isLoggedIn ? (event.status?.isSaved ?? false) : false}
        initialParticipating={isLoggedIn ? (event.status?.isParticipating ?? false) : false}
        initialLikeCount={isLoggedIn ? (event.status?.countLikes ?? 0) : 0}
        isLoggedIn={isLoggedIn}
      />
      <TouchableOpacity style={[styles.calendarButton, {
        backgroundColor: "#28a745", justifyContent: "center", marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12
      }]}
        onPress={async () => {
          const tags = ["iziclub", "sport", event.type?.toLowerCase() || "event", event.address.city?.toLowerCase().replace(/\s+/g, "")]
            .filter(Boolean)
            .map((tag) => `#${tag}`)
            .join(" ");

          const shareText = `Regarde cet événement !\n\n🎉 ${event.name}\n📍 ${event.address.city}\n🗓️ ${formatEventDate(event.eventDate)}\n⏰ ${formatEventTime(event.startDate)} - ${formatEventTime(event.endDate)}\n\n${event.description || "Un événement à découvrir sur iziclub."}\n\n${tags}\n\nDécouvre l'événement sur iziclub : https://iziclub.fr`;

          try {
            await Share.share({
              title: `Regarde cet événement : ${event.name}`,
              message: shareText,
              url: event.banner_url,
            });
          } catch (error) {
            console.error("Erreur partage natif :", error);
          }
        }}
      >
        <Ionicons name="share-social-outline" size={20} color="white" />
        <Text style={styles.calendarButtonText}>Partager</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
