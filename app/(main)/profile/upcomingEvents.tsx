import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpcomingEventsScreen() {
  const insets = useSafeAreaInsets();

  // Simulation des événements à venir
  const upcomingEvents = [
    { 
      id: '1', 
      title: 'Tournoi Open Nancy', 
      day: '12', 
      month: 'JUIN',
      time: '14:00',
      location: 'Nancy Tennis Club',
      category: 'Tennis'
    },
    { 
      id: '2', 
      title: 'Session Padel Découverte', 
      day: '18', 
      month: 'JUIN',
      time: '10:30',
      location: 'Padel Arena',
      category: 'Padel'
    },
    { 
      id: '3', 
      title: 'Stage Été Intensif', 
      day: '05', 
      month: 'JUIL',
      time: '09:00',
      location: 'Metz Sport Park',
      category: 'Fitness'
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace("/profile")} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À venir</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={upcomingEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            {/* BLOC DATE STYLE CALENDRIER */}
            <View style={styles.dateBlock}>
              <Text style={styles.dateDay}>{item.day}</Text>
              <Text style={styles.dateMonth}>{item.month}</Text>
            </View>

            {/* CONTENU DE L'ÉVÉNEMENT */}
            <TouchableOpacity style={styles.eventCard} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryTag}>{item.category}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              
              <Text style={styles.eventTitle}>{item.title}</Text>
              
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>

              <TouchableOpacity style={styles.ticketButton}>
                <Text style={styles.ticketButtonText}>Voir mon pass</Text>
                <Ionicons name="qr-code-outline" size={16} color="#4A78FF" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Aucun événement prévu</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  
  eventRow: {
    flexDirection: 'row',
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  dateBlock: {
    width: 60,
    alignItems: 'center',
    paddingTop: 5,
  },
  dateDay: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  dateMonth: { fontSize: 12, fontWeight: 'bold', color: '#FFB900' }, // Jaune comme ton icône de profil
  
  eventCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Ombre
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4A78FF',
    backgroundColor: '#Eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  timeText: { fontSize: 12, fontWeight: '600', color: '#888' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationText: { fontSize: 13, color: '#666', marginLeft: 4 },
  
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  ticketButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A78FF',
    marginRight: 8,
  },

  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 10 },
});