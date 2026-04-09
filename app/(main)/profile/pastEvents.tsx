import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PastEventsScreen() {
  const insets = useSafeAreaInsets();

  // Simulation des événements passés
  const pastEvents = [
    { 
      id: '1', 
      title: 'Open de Printemps', 
      date: '15 Mars 2024', 
      location: 'Tennis Club de Nancy',
      category: 'Tennis',
      imageUrl: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: '2', 
      title: 'Soirée Networking Padel', 
      date: '02 Février 2024', 
      location: 'Padel Arena',
      category: 'Padel',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=300&auto=format&fit=crop'
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
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={pastEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.pastCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={styles.dateText}>{item.date}</Text>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="star-outline" size={14} color="#6D5AD3" />
                  <Text style={styles.actionButtonText}>Noter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { marginLeft: 10 }]}>
                  <Ionicons name="receipt-outline" size={14} color="#666" />
                  <Text style={[styles.actionButtonText, { color: '#666' }]}>Facture</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Aucun événement passé</Text>
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
  
  pastCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    opacity: 0.8, // Effet "passé" légèrement désaturé
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateText: { fontSize: 11, color: '#999', fontWeight: '600' },
  categoryText: { fontSize: 10, color: '#6D5AD3', fontWeight: 'bold', textTransform: 'uppercase' },
  titleText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  locationText: { fontSize: 12, color: '#888', marginTop: 2 },
  
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6D5AD3',
    marginLeft: 5,
  },

  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 10 },
});