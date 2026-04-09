import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ImageBackground 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const insets = useSafeAreaInsets();

  const categories = [
    { id: '1', name: 'Tennis', icon: 'tennisball' },
    { id: '2', name: 'Padel', icon: 'trophy' },
    { id: '3', name: 'Fitness', icon: 'fitness' },
    { id: '4', name: 'Foot', icon: 'football' },
  ];

const featuredEvents = [
  { 
    id: '1', 
    title: 'Tournoi Open Nancy', 
    date: '12 Juin', 
    type: 'Tennis', 
    // Image de tennis stable via Unsplash
    imageUrl: 'https://i.ytimg.com/vi/CxG48CbRsbA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAL5qLZ0GLxdFCxFKXNKJAUX-VMxA'
  },
  { 
    id: '2', 
    title: 'Stage Padel Été', 
    date: '05 Juillet', 
    type: 'Padel',
    // Image de padel stable via Unsplash
    imageUrl: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/10/29/e2/51.jpg'
  },
];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>Prêt à Bouger ?</Text>
          </View>
          <TouchableOpacity style={styles.profileBadge}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* 2. RECHERCHE */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push("/search")}
          style={styles.searchSection}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" style={{ marginRight: 10 }} />
            <Text style={{ color: '#999', flex: 1 }}>Rechercher un club, un sport...</Text>
            <Ionicons name="options-outline" size={20} color="#4A78FF" />
          </View>
        </TouchableOpacity>

        {/* 3. SECTION ÉVÉNEMENTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements à la une</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/search", params: { tab: "Événements" } })}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, marginTop: 15 }}
        >
          {featuredEvents.map((event) => (
            <TouchableOpacity key={event.id} activeOpacity={0.9} onPress={() => console.log('Event', event.id)}>
              <ImageBackground 
                source={{ uri: event.imageUrl }} 
                style={styles.eventCardImage}
                imageStyle={{ borderRadius: 18 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.eventGradient}
                >
                  <View style={styles.eventBadge}>
                    <Text style={styles.eventBadgeText}>{event.type}</Text>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventDate}>{event.date}</Text>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. BANNIÈRE MAP */}
        <TouchableOpacity 
          onPress={() => router.push("/(main)/search/map")}
          style={styles.mapBanner}
        >
          <View style={styles.mapBannerContent}>
            <Text style={styles.mapBannerTitle}>Explorer la carte</Text>
            <Text style={styles.mapBannerSub}>Trouve les clubs autour de toi</Text>
          </View>
          <View style={styles.mapBannerCircle}>
            <Ionicons name="map" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* 5. SPORTS (CATÉGORIES) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sports</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push({
        pathname: "/search",
        params: { q: cat.name }
      })}>
              <View style={styles.categoryIcon}>
                <Ionicons name={cat.icon as any} size={24} color="#4A78FF" />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 6. CLUBS RECOMMANDÉS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clubs recommandés</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recomendedContainer}>
  <TouchableOpacity style={styles.clubCard} onPress={() => router.push("/search")}>
    {/* Remplacement du placeholder par la vraie image */}
    <Image 
      source={{ uri: 'https://lh4.googleusercontent.com/proxy/9Ml9D7qivm1gXlfVAJ0_TkRZErUYCwb-jIPfZi_ii2MVYPr1uQSn3WXjGz9JA9nxzjT-svTVHGREDnsH5gFA' }} 
      style={styles.clubImage} 
      resizeMode="cover"
    />
    
    <View style={styles.clubInfo}>
      <Text style={styles.clubName}>Nancy Tennis Club</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={14} color="#4A78FF" />
        <Text style={styles.clubLocation}>Nancy • 1.2 km</Text>
      </View>
    </View>
  </TouchableOpacity>
</View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  // Dans ton StyleSheet.create :
clubImage: {
  width: '100%',
  height: 150, // On garde la même hauteur que l'ancien placeholder
  backgroundColor: '#F5F5F5', // Fond de secours pendant le chargement
},
// Tu peux supprimer clubImagePlaceholder s'il n'est plus utilisé
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  profileBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: { paddingHorizontal: 20, marginTop: 20 },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  seeAll: { color: '#4A78FF', fontWeight: '600', fontSize: 13 },
  
  // --- STYLES ÉVÉNEMENTS ---
  eventCardImage: {
    width: 260,
    height: 140,
    marginRight: 15,
    borderRadius: 18,
    overflow: 'hidden',
  },
  eventGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'flex-end',
  },
  eventBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4A78FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventBadgeText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  eventContent: {
    // Conteneur pour aligner le texte
  },
  eventDate: { 
    color: 'rgba(255,255,255,0.9)', 
    fontSize: 11, 
    marginBottom: 2,
    fontWeight: '600'
  },
  eventTitle: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // --- BANNIÈRE MAP ---
  mapBanner: {
    margin: 20,
    backgroundColor: '#4A78FF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapBannerContent: { flex: 1 },
  mapBannerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  mapBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  mapBannerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- CATÉGORIES & CLUBS ---
  categoriesScroll: { paddingLeft: 20, marginTop: 15 },
  categoryCard: { marginRight: 18, alignItems: 'center' },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#Eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: { fontSize: 12, fontWeight: '600', color: '#444' },
  recomendedContainer: { paddingHorizontal: 20, marginTop: 15, paddingBottom: 30 },
  clubCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  clubInfo: { padding: 12 },
  clubName: { fontSize: 15, fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  clubLocation: { fontSize: 12, color: '#888', marginLeft: 4 },
});