import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Import de tes services API
import { getLikedClubs, unlikeClub, getClubById } from '@/services/clubs.service' // Adapte le chemin d'accès
import { getLikedEvents, unlikeEvent, getEventById } from '@/services/events.service'; // Adapte le chemin d'accès

const { width } = Dimensions.get('window');

type TabType = 'events' | 'clubs';

export default function LikedItemsScreen() {
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Chargement des données selon l'onglet actif
  // Chargement des données selon l'onglet actif
  const fetchLikedItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'events') {
        const response = await getLikedEvents();
        const rawLikes = response?.data || response || [];

        if (rawLikes.length === 0) {
          setEvents([]);
          return;
        }

        const detailPromises = rawLikes.map(async (like: any) => {
          try {
            const eventId = like.eventId || like.id;
            const eventDetail = await getEventById(eventId);
            
            // 💡 SÉCURITÉ : Extraction si c'est un tableau enveloppé dans data
            const eventData = Array.isArray(eventDetail?.data)
              ? eventDetail.data[0]
              : (eventDetail?.data || eventDetail);

            return {
              ...eventData,
              likeId: like.id,      
              id: eventId        
            };
          } catch (err) {
            console.error(`Impossible de charger les détails de l'événement`, err);
            return null;
          }
        });

        const resolvedEvents = await Promise.all(detailPromises);
        setEvents(resolvedEvents.filter(item => item !== null));

      } else {
        const response = await getLikedClubs();
        const rawLikes = response?.data || response || [];

        if (rawLikes.length === 0) {
          setClubs([]);
          return;
        }

        // On vérifie s'il faut aller chercher les détails via Promise.all
        const firstItem = rawLikes[0];
        const hasIdPivot = firstItem?.clubId || firstItem?.id;

        if (hasIdPivot) {
          const detailPromises = rawLikes.map(async (like: any) => {
            try {
              const clubId = like.clubId || like.id;
              const clubDetail = await getClubById(clubId);
              
              // 💡 RECOUVREMENT DU BUG : Extraction propre du premier élément du tableau
              const clubData = Array.isArray(clubDetail?.data) 
                ? clubDetail.data[0] 
                : (clubDetail?.data || clubDetail);

              return { 
                ...clubData, 
                likeId: like.id, 
                id: clubId 
              };
            } catch (err) {
              console.error(`Impossible de charger les détails du club`, err);
              return null;
            }
          });
          const resolvedClubs = await Promise.all(detailPromises);
          setClubs(resolvedClubs.filter(item => item !== null));
        } else {
          setClubs(rawLikes);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la reconstruction des données de favoris:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedItems();
  }, [activeTab]);

  // Gestion de l'action unlike
  const handleUnlike = async (id: string, type: TabType) => {
    try {
      if (type === 'events') {
        await unlikeEvent(id);
        setEvents(prev => prev.filter(item => item.id !== id));
      } else {
        await unlikeClub(id);
        setClubs(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error(`Erreur lors du unlike du ${type}:`, error);
    }
  };

  const formatDate = (dateString: string) => {
  if (!dateString) return 'À venir';
  try {
    const date = new Date(dateString);
    // Exemple : "19 août 2026"
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return 'À venir';
  }
};

  // Rendu d'une carte Événement ou Club
  const renderItem = ({ item }: { item: any }) => {
    const isEvent = activeTab === 'events';
    const title = item.name || item.title;
    // Fallback d'image si ton API ne renvoie pas d'image valide pour le moment
    const imageSource = item.profile?.profileImagePath || item.coverImagePath || (isEvent 
      ? 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg'
      : 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg');

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => router.push(isEvent ? `/search/event/${item.id}` : `/search/club/${item.id}`)}
      >
        <ImageBackground 
          source={{ uri: imageSource }} 
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
            style={styles.gradient}
          >
            {/* Bouton de Like (Cliqué) */}
            <TouchableOpacity 
              style={styles.heartButton}
              activeOpacity={0.7}
              onPress={() => handleUnlike(item.id, activeTab)}
            >
              <Ionicons name="heart" size={20} color="#FF5A5F" />
            </TouchableOpacity>
            
            <View>
              <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
              
              <View style={styles.infoRow}>
                {isEvent ? (
                  <>
                    <Ionicons name="calendar-outline" size={13} color="#EAEAEA" />
                    <Text style={styles.infoText}>{formatDate(item.eventDate) || 'À venir'}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="trophy-outline" size={13} color="#EAEAEA" />
                    <Text style={styles.infoText}>{item.type || 'Club Sportif'}</Text>
                  </>
                )}
                
                <Ionicons name="location-outline" size={13} color="#EAEAEA" style={{ marginLeft: 12 }} />
                <Text style={styles.infoText} numberOfLines={1}>{item.address?.city || item.profile?.address?.city || 'Localisation non précisée'}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // Rendu de l'état vide (Empty State)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons 
          name={activeTab === 'events' ? "calendar-outline" : "shield-outline"} 
          size={50} 
          color="#A0A0A2" 
        />
        <Ionicons name="heart" size={22} color="#FF5A5F" style={styles.emptyHeartBadge} />
      </View>
      <Text style={styles.emptyTitle}>Rien pour le moment</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'events' 
          ? "Les événements que tu ajouteras en favoris apparaîtront ici."
          : "Trouve tes clubs préférés et rejoins la communauté !"}
      </Text>
      <TouchableOpacity 
        style={styles.exploreBtn}
        onPress={() => router.push("/search")}
      >
        <Text style={styles.exploreBtnText}>Découvrir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container]}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* SEGMENTED TABS CONTROLLER */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Ionicons name="flash" size={16} color={activeTab === 'events' ? '#4A78FF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Événements</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'clubs' && styles.activeTab]}
          onPress={() => setActiveTab('clubs')}
        >
          <Ionicons name="people" size={16} color={activeTab === 'clubs' ? '#4A78FF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'clubs' && styles.activeTabText]}>Clubs</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OR LOADER */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A78FF" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'events' ? events : clubs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFF',
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  
  // Onglets de navigation (Tabs)
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFFF',
    marginHorizontal: 16,
    marginVertical: 14,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  activeTabText: { color: '#4A78FF' },

  // Listes & Cartes
  listContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 4 },
  card: {
    height: 190,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageBackground: { flex: 1 },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  heartButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    padding: 9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { color: 'white', fontSize: 19, fontWeight: '700', marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { color: '#EAEAEA', fontSize: 12, marginLeft: 4, fontWeight: '500' },
  
  // Chargement
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // États vides de l'UI (Empty State UX)
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 80
  },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  emptyHeartBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 2,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  exploreBtn: {
    backgroundColor: '#4A78FF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  exploreBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});