import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ImageBackground, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Import de tes services API
import { getLikedClubs, unlikeClub, getClubById } from '@/services/clubs.service' // Adapte le chemin d'accès
import { getLikedEvents, unlikeEvent, getEventById } from '@/services/events.service';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
      <Card
        bordered
        padding={0}
        style={styles.card}
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
            <IconButton
              name="heart"
              color={Colors.rouge}
              accessibilityLabel="Retirer des favoris"
              onPress={() => handleUnlike(item.id, activeTab)}
              style={styles.heartButton}
            />
            
            <View>
              <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
              
              <View style={styles.infoRow}>
                {isEvent ? (
                  <>
                    <Icon name="calendar-outline" size={13} color={Colors.grisClair} />
                    <Text style={styles.infoText}>{formatDate(item.eventDate) || 'À venir'}</Text>
                  </>
                ) : (
                  <>
                    <Icon name="trophy-outline" size={13} color={Colors.grisClair} />
                    <Text style={styles.infoText}>{item.type || 'Club Sportif'}</Text>
                  </>
                )}
                
                <Icon name="location-outline" size={13} color={Colors.grisClair} style={{ marginLeft: 12 }} />
                <Text style={styles.infoText} numberOfLines={1}>{item.address?.city || item.profile?.address?.city || 'Localisation non précisée'}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Card>
    );
  };

  // Rendu de l'état vide (Empty State)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Icon 
          name={activeTab === 'events' ? "calendar-outline" : "shield-outline"} 
          size={50} 
          color={Colors.gris} 
        />
        <Icon name="heart" size={22} color={Colors.rouge} style={styles.emptyHeartBadge} />
      </View>
      <Text style={styles.emptyTitle}>Rien pour le moment</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'events' 
          ? "Les événements que tu ajouteras en favoris apparaîtront ici."
          : "Trouve tes clubs préférés et rejoins la communauté !"}
      </Text>
      <Button label="Découvrir" onPress={() => router.push("/search")} />
    </View>
  );

  return (
    <View style={[styles.container]}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={{ width: 44 }} /> 
      </View>

      {/* SEGMENTED TABS CONTROLLER */}
      <Tabs
        style={styles.tabsContainer}
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: 'events', label: 'Événements', icon: 'flash' },
          { value: 'clubs', label: 'Clubs', icon: 'people' },
        ]}
      />

      {/* LIST OR LOADER */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.noir} />
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
  headerTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  
  // Onglets de navigation (Tabs)
  tabsContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },

  // Listes & Cartes
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  card: {
    height: 190,
    marginBottom: 16,
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
  },
  cardTitle: { color: Colors.blanc, fontSize: 20, fontFamily: Fonts.titre, marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { color: Colors.grisClair, fontSize: 12, marginLeft: 4, fontFamily: Fonts.medium },
  
  // Chargement
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fond },

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
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  emptyHeartBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.blanc,
    borderRadius: 12,
    padding: 2,
  },
  emptyTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
});