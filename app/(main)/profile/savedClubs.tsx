import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SavedClubsScreen() {
  const insets = useSafeAreaInsets();

  // Simulation des clubs enregistrés
  const savedClubs = [
    { 
      id: '1', 
      name: 'Nancy Tennis Club', 
      location: 'Nancy • 1.2 km',
      rating: 4.8,
      imageUrl: 'https://lh4.googleusercontent.com/proxy/9Ml9D7qivm1gXlfVAJ0_TkRZErUYCwb-jIPfZi_ii2MVYPr1uQSn3WXjGz9JA9nxzjT-svTVHGREDnsH5gFA'
    },
    { 
      id: '2', 
      name: 'Padel Arena', 
      location: 'Metz • 15 km',
      rating: 4.9,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz-_5SYKZ_UCSV39sgu9dmp6F4t-GOLfZGdw&s'
    },
    { 
      id: '3', 
      name: 'Urban Soccer', 
      location: 'Nancy South • 4 km',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=300&auto=format&fit=crop'
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
        <Text style={styles.headerTitle}>Clubs enregistrés</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={savedClubs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.clubCard} activeOpacity={0.7}>
            <Image source={{ uri: item.imageUrl }} style={styles.clubImage} />
            
            <View style={styles.clubInfo}>
              <View>
                <Text style={styles.clubName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={14} color="#4A78FF" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              </View>
              
              <View style={styles.footerRow}>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={12} color="#FFB900" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="bookmark" size={22} color="#4A78FF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Aucun club enregistré</Text>
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
  clubCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Ombre pour Android
    elevation: 2,
  },
  clubImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  clubInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  clubName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 13, color: '#888', marginLeft: 4 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#FFB900', marginLeft: 4 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 10 },
});