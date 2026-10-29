import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import de tes services API
import { getSavedClubs, unsaveClub, getClubById } from '@/services/clubs.service'; // Adapte le chemin d'accès
import { getSavedEvents, unsaveEvent, getEventById } from '@/services/events.service';
import { Colors } from '@/constants/colors';

type TabType = 'events' | 'clubs';

export default function SavedItemsScreen() {
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Récupération des données détaillées en parallèle (Promise.all)
  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'events') {
        const response = await getSavedEvents();
        const rawSaves = response?.data || response || [];

        if (rawSaves.length === 0) {
          setEvents([]);
          return;
        }

        // Récupération en parallèle du détail de chaque événement sauvegardé
        const detailPromises = rawSaves.map(async (save: any) => {
          try {
            // S'adapte si la clé est eventId ou id
            const eventId = save.eventId || save.id;
            const eventDetail = await getEventById(eventId);
            return {
              ...eventDetail?.data,
              ...eventDetail,
              saveId: save.id,
              id: eventId,
            };
          } catch (err) {
            console.error(`Impossible de charger les détails du save événement`, err);
            return null;
          }
        });

        const resolvedEvents = await Promise.all(detailPromises);
        setEvents(resolvedEvents.filter(item => item !== null));

      } else {
        const response = await getSavedClubs();
        const rawSaves = response?.data || response || [];
        if (rawSaves.length === 0) {
          setClubs([]);
          return;
        }

        // Récupération en parallèle du détail de chaque club sauvegardé
        // Récupération en parallèle du détail de chaque club sauvegardé
const detailPromises = rawSaves.map(async (save: any) => {
  try {
    const clubId = save.clubId || save.id;
    const clubDetail = await getClubById(clubId);
    
    // 💡 CORRECTION ICI : On vérifie si data est un tableau, si oui on prend le premier élément
    const clubData = Array.isArray(clubDetail?.data) 
      ? clubDetail.data[0] 
      : (clubDetail?.data || clubDetail);

    return {
      ...clubData, // On spread l'objet propre sans l'index "0"
      saveId: save.id,
      id: clubId,
    };
  } catch (err) {
    console.error(`Impossible de charger les détails du save club`, err);
    return null;
  }
});

        const resolvedClubs = await Promise.all(detailPromises);
        setClubs(resolvedClubs.filter(item => item !== null));
      }
    } catch (error) {
      console.error(`Erreur lors de la reconstruction des éléments enregistrés:`, error);
    } finally {
      setLoading(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchSavedItems();
  }, [activeTab])
);

  const handleUnsave = async (id: string, type: TabType) => {
    try {
      if (type === 'events') {
        await unsaveEvent(id);
        setEvents(prev => prev.filter(item => item.id !== id));
      } else {
        await unsaveClub(id);
        setClubs(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error(`Erreur lors du unsave du ${type}:`, error);
    }
  };

  // Rendu des cartes horizontales (Style épuré de ton application)
  const renderItem = ({ item }: { item: any }) => {
    const isEvent = activeTab === 'events';
    const title = item.name || item.title;
    const imageSource = item.profile?.profileImagePath || item.coverImagePath || (isEvent 
      ? 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg'
      : 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg');
    return (
      <TouchableOpacity 
        style={styles.clubCard} 
        activeOpacity={0.7}
        onPress={() => router.push(isEvent ? `/search/event/${item.id}` : `/search/club/${item.id}`)}
      >
        <Image source={{ uri: imageSource }} style={styles.clubImage} />
        
        <View style={styles.clubInfo}>
          <View>
            <Text style={styles.clubName} numberOfLines={1}>{title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={Colors.bleu} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.address?.city || item.profile?.address?.city || 'Localisation non précisée'}
              </Text>
            </View>
          </View>
          
          <View style={styles.footerRow}>
            {/* Icône de marque-page cliqué */}
            <TouchableOpacity 
              onPress={() => handleUnsave(item.id, activeTab)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="bookmark" size={22} color={Colors.vert} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Rendu de l'état vide personnalisé (Empty State UX)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons 
          name={activeTab === 'events' ? "calendar-outline" : "business-outline"} 
          size={46} 
          color={Colors.gris} 
        />
        <Ionicons name="bookmark" size={20} color={Colors.vert} style={styles.emptyBookmarkBadge} />
      </View>
      <Text style={styles.emptyTitle}>Aucun enregistrement</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'events' 
          ? "Sauvegarde des événements pour planifier tes futures séances de sport."
          : "Enregistre des clubs pour retrouver facilement leurs horaires et actus."}
      </Text>
      <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push("/search")}>
        <Text style={styles.exploreBtnText}>Parcourir la carte</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.noir} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enregistrés</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* TABS CONTROLLER CONTAINER */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Ionicons name="bookmark-outline" size={15} color={activeTab === 'events' ? Colors.vert : Colors.gris} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Événements</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'clubs' && styles.activeTab]}
          onPress={() => setActiveTab('clubs')}
        >
          <Ionicons name="business-outline" size={15} color={activeTab === 'clubs' ? Colors.vert : Colors.gris} />
          <Text style={[styles.tabText, activeTab === 'clubs' && styles.activeTabText]}>Clubs</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENU OU LOADER */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.bleu} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'events' ? events : clubs}
          keyExtractor={(item) => `save-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 15,
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
    borderRadius: 12,
    backgroundColor: Colors.fond,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.noir },
  
  // Segmented Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.blanc,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.fond,
    shadowColor: Colors.noir,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.gris },
  activeTabText: { color: Colors.vert },

  // Cartes horizontales intégrées
  clubCard: {
    flexDirection: 'row',
    backgroundColor: Colors.blanc,
    borderRadius: 20,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    shadowColor: Colors.noir,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  clubImage: {
    width: 85,
    height: 85,
    borderRadius: 14,
    backgroundColor: Colors.fond,
  },
  clubInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  clubName: { fontSize: 16, fontWeight: '700', color: Colors.noir },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 13, color: Colors.gris, marginLeft: 4, flex: 1 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fond },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 80 },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  emptyBookmarkBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.blanc,
    borderRadius: 12,
    padding: 2,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.noir, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: Colors.gris, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  exploreBtn: {
    backgroundColor: Colors.noir,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  exploreBtnText: { color: Colors.blanc, fontWeight: 'bold', fontSize: 14 },
});