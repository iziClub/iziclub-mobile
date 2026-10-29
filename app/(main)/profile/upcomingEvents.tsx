import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 💡 Import de ton service d'événements
import { getParticipatingEvents } from '@/services/events.service';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

export default function UpcomingEventsScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 💡 useFocusEffect rafraîchit la liste automatiquement dès qu'on arrive sur l'écran
  useFocusEffect(
    useCallback(() => {
      const fetchMyParticipations = async () => {
  try {
    setLoading(true);
    const response = await getParticipatingEvents();
    
    const participations = response?.data || response || [];
    
    // 💡 Tri du plus récent au plus vieux basé sur la date de début (startDate)
    const sortedParticipations = participations.sort((a: any, b: any) => {
      const dateA = new Date(a.event?.startDate || 0).getTime();
      const dateB = new Date(b.event?.startDate || 0).getTime();
      
      return dateA - dateB; // Ordre décroissant : du plus récent au plus vieux
    });

    setEvents(sortedParticipations);
  } catch (error) {
    console.error("Erreur lors de la récupération et du tri des participations :", error);
  } finally {
    setLoading(false);
  }
};

      fetchMyParticipations();
    }, [])
  );

  // 💡 Fonction utilitaire pour extraire et formater la date du format ISO 8601
  const formatEventDate = (dateString: string) => {
    if (!dateString) return { day: '--', month: '---', time: '--:--' };
    
    const date = new Date(dateString);
    
    const day = date.getDate().toString().padStart(2, '0');
    
    // Extrait les 3 premières lettres du mois en majuscules (ex: "SEPT")
    const month = date.toLocaleDateString('fr-FR', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
      
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return { day, month, time };
  };

  return (
    <View style={[styles.container]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={Colors.noir} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Participations</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        // 💡 Loader central pendant le chargement initial
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.noir} />
          <Text style={styles.loadingText}>Chargement de vos sorties...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            // L'objet réel de l'événement est imbriqué dans la clé `event`
            const eventDetails = item.event;
            if (!eventDetails) return null;

            const { day, month, time } = formatEventDate(eventDetails.startDate);

            return (
              <View style={styles.eventRow}>
                {/* BLOC DATE STYLE CALENDRIER */}
                <View style={styles.dateBlock}>
                  <Text style={styles.dateDay}>{day}</Text>
                  <Text style={styles.dateMonth}>{month}</Text>
                </View>

                {/* CONTENU DE L'ÉVÉNEMENT */}
                <TouchableOpacity 
                  style={styles.eventCard} 
                  activeOpacity={0.7}
                  onPress={() => router.push(`/search/event/${eventDetails.id}`)} // Redirection vers le détail si applicable
                >
                  <View style={styles.cardHeader}>
                    {/* Tu peux afficher un tag fixe ou utiliser un fallback s'il n'y a pas de catégorie */}
                    <Text style={styles.categoryTag}>Événement</Text>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                  
                  <Text style={styles.eventTitle} numberOfLines={2}>{eventDetails.title}</Text>
                  
                  <View style={styles.locationRow}>
                    <Icon name="location-outline" size={14} color={Colors.bleu} />
                    {/* Concaténation propre de la rue et de la ville reçues de l'API */}
                    <Text style={styles.locationText} numberOfLines={1}>
                      {eventDetails.location?.street}, {eventDetails.location?.city}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={60} color={Colors.gris} />
              <Text style={styles.emptyText}>Vous ne participez à aucun événement</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: Colors.blanc,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grisClair,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.fond,
  },
  headerTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  
  eventRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  dateBlock: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  dateDay: { fontSize: 24, fontFamily: Fonts.titre, color: Colors.noir },
  dateMonth: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.rouge },
  
  eventCard: {
    flex: 1,
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.rouge,
    backgroundColor: Colors.rougeClair,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: 'uppercase',
  },
  timeText: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.grisTexte },
  eventTitle: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, marginLeft: 4, flex: 1 },
  
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.grisClair,
    paddingTop: 12,
  },
  ticketButtonText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.noir,
    marginRight: 8,
  },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: Colors.fond },
  loadingText: { marginTop: 12, color: Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: Colors.grisTexte, marginTop: 12 },
});