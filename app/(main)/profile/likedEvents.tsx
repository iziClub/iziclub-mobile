import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function LikedEventsScreen() {
  const insets = useSafeAreaInsets();

  // Simulation des événements que l'utilisateur a likés
  const likedEvents = [
    { 
      id: '1', 
      title: 'Tournoi Open Nancy', 
      date: '12 Juin', 
      location: 'Nancy Tennis Club',
      imageUrl: 'https://images.unsplash.com/photo-1595435066359-6286386735b2?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '2', 
      title: 'Gala de Fitness', 
      date: '20 Juin', 
      location: 'Gym Center',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER AVEC BOUTON RETOUR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Événements likés</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={likedEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.eventCard} 
            onPress={() => console.log('Détail event', item.id)}
          >
            <ImageBackground 
              source={{ uri: item.imageUrl }} 
              style={styles.imageBackground}
              imageStyle={{ borderRadius: 15 }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              >
                <TouchableOpacity style={styles.heartButton}>
                  <Ionicons name="heart" size={20} color="#FF5A5F" />
                </TouchableOpacity>
                
                <View>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="white" />
                    <Text style={styles.infoText}>{item.date}</Text>
                    <Ionicons name="location-outline" size={14} color="white" style={{ marginLeft: 10 }} />
                    <Text style={styles.infoText}>{item.location}</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Aucun événement liké pour le moment</Text>
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
  eventCard: {
    height: 180,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  imageBackground: { flex: 1 },
  gradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
    borderRadius: 15,
  },
  heartButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
  },
  eventTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  infoText: { color: 'white', fontSize: 12, marginLeft: 4 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 10 },
});