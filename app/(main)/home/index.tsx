import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { getEvents } from '@/services/events.service';
import { getClubs } from '@/services/clubs.service';
import { getCurrentUser } from '@/services/auth';
import { useFocusEffect } from 'expo-router';
import { getNotifications } from '@/services/notifications.service';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import Tag from "@/components/ui/Tag";

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { location } = useLocation();

  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [recommendedClubs, setRecommendedClubs] = useState<any[]>([]);
  const [loadingHome, setLoadingHome] = useState<boolean>(true);
  const isLoggedIn = !!user;
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const CARD_WIDTH = 260; 
  const [userName, setUserName] = useState<string | null>(null);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);

  const categories = [
  { id: '1', name: 'Football', icon: 'football' },
  { id: '2', name: 'Basketball', icon: 'basketball' },
  { id: '3', name: 'Volleyball', icon: 'american-football' }, // meilleur compromis
  { id: '4', name: 'Handball', icon: 'hand-left' },
  { id: '5', name: 'Rugby', icon: 'american-football' },
  { id: '6', name: 'Tennis', icon: 'tennisball' },
  { id: '7', name: 'Padel', icon: 'tennisball' },
  { id: '8', name: 'Badminton', icon: 'paper-plane' },
  { id: '9', name: 'Fitness', icon: 'barbell' },
  { id: '10', name: 'Musculation', icon: 'barbell' },
  { id: '11', name: 'CrossFit', icon: 'fitness' },
  { id: '12', name: 'Natation', icon: 'water' },
  { id: '13', name: 'Course à pied', icon: 'walk' },
  { id: '14', name: 'Cyclisme', icon: 'bicycle' },
  { id: '15', name: 'Arts martiaux', icon: 'shield' },
  { id: '16', name: 'Boxe', icon: 'flash' },
  { id: '17', name: 'Danse', icon: 'musical-notes' },
  { id: '18', name: 'Yoga', icon: 'leaf' },
  { id: '19', name: 'Escalade', icon: 'triangle' },
  { id: '20', name: 'Équitation', icon: 'paw' },
];

  useEffect(() => {
    const loadHome = async () => {
      setLoadingHome(true);
      try {
        const locationParams = {
          latitude: location?.latitude,
          longitude: location?.longitude,
          radiusInKm: 1500,
        };

        const eventsRes = await getEvents({ per_page: 6, ...locationParams });
        const events = eventsRes?.data ?? eventsRes?.data?.data ?? eventsRes ?? [];
        const eventsAny = events as any;
        setFeaturedEvents(Array.isArray(eventsAny) ? eventsAny : eventsAny?.data ?? []);

        const clubsRes = await getClubs({ limit: 6, ...locationParams });
        const clubs = clubsRes?.data ?? clubsRes ?? [];
        const clubsAny = clubs as any;
        setRecommendedClubs(Array.isArray(clubsAny) ? clubsAny : clubsAny?.data ?? []);
        if (user) {
          const currentUser = await getCurrentUser();
          setUserName(currentUser?.firstName || null);
        }
      } catch (err) {
        console.error('Erreur chargement homepage :', err);
      } finally {
        setLoadingHome(false);
      }
    };

    loadHome();
  }, [user, location?.latitude, location?.longitude]);

  useFocusEffect(
    useCallback(() => {
      const refreshNotifications = async () => {
        if (!user) {
          setNotificationsCount(0);
          return;
        }

        try {
          const notificationsRes = await getNotifications();
          const allNotifications = notificationsRes?.data || [];
          const unreadCount = allNotifications.filter((notification: any) => notification.isSeen === false || notification.isUnread === true).length;
          setNotificationsCount(unreadCount);
        } catch (err) {
          console.error("Erreur chargement notifications :", err);
        }
      };

      refreshNotifications();
    }, [user])
  );

  return (
    <View style={[styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {userName || ''} 👋</Text>
            <Text style={styles.userName}>Prêt à Bouger ?</Text>
          </View>
          <View>
            <IconButton
              name="notifications-outline"
              iconSize={22}
              accessibilityLabel={notificationsCount > 0 ? `Notifications, ${notificationsCount} non lues` : "Notifications"}
              onPress={() => router.push("/notifications")}
            />
            {/* Pastille rouge de notification non lue */}
            {notificationsCount > 0 && <View style={styles.notificationDot} pointerEvents="none" />}
          </View>
        </View>

        {/* 2. RECHERCHE */}
        <Pressable
          onPress={() => router.push("/search")}
          accessibilityRole="search"
          style={styles.searchSection}
        >
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color={Colors.gris} style={{ marginRight: 12 }} />
            <Text style={{ color: Colors.gris, flex: 1 }}>Rechercher un club, un sport...</Text>
            <Icon name="options-outline" size={20} color={Colors.noir} />
          </View>
        </Pressable>

        {!isLoggedIn && (
          <View style={styles.loginBanner}>
            <Text style={styles.loginBannerTitle}>Connecte-toi pour profiter de toutes les fonctionnalités</Text>
            <View style={styles.loginBannerActions}>
              <Button label="Se connecter" onPress={() => router.push('/(auth)/login')} />
              <Button label="Créer un compte" variant="secondaire" onPress={() => router.push('/(auth)/register')} />
            </View>
          </View>
        )}

        {/* 3. SECTION ÉVÉNEMENTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements à la une</Text>
          <Button variant="lien" label="Voir tout" onPress={() => router.push({ pathname: "/search", params: { tab: "Événements" } })} />
        </View>
        
        <ScrollView 
          horizontal 
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 12, marginTop: 16 }}
          onScroll={({ nativeEvent }) => {
            const x = nativeEvent.contentOffset.x;
            const idx = Math.round(x / (CARD_WIDTH + 15));
            setCarouselIndex(idx);
          }}
          scrollEventThrottle={16}
        >
          {loadingHome ? (
            Array.from({ length: 2 }).map((_, index) => (
              <View key={index} style={{ width: CARD_WIDTH, height: 140, borderRadius: 16, marginRight: 16, backgroundColor: Colors.grisClair }} />
            ))
          ) : (
            featuredEvents.map((event: any) => (
              <Card key={event.id} padding={0} onPress={() => router.push(`/search/event/${event.id}`)} style={{ marginRight: 16 }}>
                <ImageBackground 
                  source={{ uri: event.coverImagePath || 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg' }} 
                  style={styles.eventCardImage}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                    style={styles.eventGradient}
                  >
                    {!!(event.type ?? event.category) && (
                      <Tag label={event.type ?? event.category} variant="actif" style={styles.eventBadge} />
                    )}
                    <View style={styles.eventContent}>
                      <Text style={styles.eventDate}>{event.eventDate ? new Date(event.eventDate).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : ''}</Text>
                      <Text style={styles.eventTitle} numberOfLines={1}>{event.name ?? event.title}</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </Card>
            ))
          )}
        </ScrollView>

        {/* Carousel dots */}
        {!loadingHome && featuredEvents.length > 0 && (
          <View style={styles.carouselDots}>
            {featuredEvents.map((_, i) => (
              <View key={i} style={[styles.dot, i === carouselIndex && styles.activeDot]} />
            ))}
          </View>
        )}

        {/* 4. BANNIÈRE MAP */}
        <Pressable
          onPress={() => router.push("/(main)/search/map")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.mapBanner, pressed && { backgroundColor: Colors.noirSurvol }]}
        >
          <View style={styles.mapBannerContent}>
            <Text style={styles.mapBannerTitle}>Explorer la carte</Text>
            <Text style={styles.mapBannerSub}>Trouve les clubs autour de toi</Text>
          </View>
          <View style={styles.mapBannerCircle}>
            <Icon name="map" size={24} color={Colors.blanc} />
          </View>
        </Pressable>

        {/* 5. SPORTS (CATÉGORIES) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sports</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              accessibilityRole="button"
              style={({ pressed }) => [styles.categoryCard, pressed && { opacity: 0.6 }]}
              onPress={() => router.push({ pathname: "/search", params: { q: cat.name } })}
            >
              <View style={styles.categoryIcon}>
                <Icon name={cat.icon as any} size={24} color={Colors.bleu} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 6. CLUBS RECOMMANDÉS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clubs recommandés</Text>
          <Button variant="lien" label="Voir tout" onPress={() => router.push("/search")} />
        </View>

        <View style={styles.recomendedContainer}>
          {loadingHome ? (
            <View style={styles.clubGrid}>
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} style={styles.clubGridItem}>
                  <View style={[styles.clubImage, { backgroundColor: Colors.grisClair }]} />
                  <View style={{ height: 14, width: '70%', marginTop: 12, borderRadius: 8, backgroundColor: Colors.grisClair }} />
                  <View style={{ height: 12, width: '45%', marginTop: 8, borderRadius: 8, backgroundColor: Colors.grisClair }} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.clubGrid}>
              {recommendedClubs.map((club: any) => (
                <Card key={club.id} bordered padding={0} style={styles.clubGridItem} onPress={() => router.push(`/search/club/${club.id}`)}>
                  <Image 
                    source={{ uri: club.profile?.profileImagePath || club.profile?.bannerPath || club.image || 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg' }} 
                    style={styles.clubImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.locationRow}>
                      <Icon name="location-sharp" size={14} color={Colors.bleu} />
                      <Text style={styles.clubLocation}>{club.city ?? club.location ?? ''}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.fond,
  },
  clubImage: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.fond,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  greeting: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte },
  userName: { fontSize: 20, fontFamily: Fonts.titre, color: Colors.noir },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 8.5,
    backgroundColor: Colors.rouge,
    borderWidth: 1.5,
    borderColor: Colors.blanc,
  },
  searchSection: { paddingHorizontal: 20, marginTop: 20 },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: Colors.blanc,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  
  // --- STYLES ÉVÉNEMENTS ---
  eventCardImage: {
    width: 260,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  eventBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  eventContent: {
    // Conteneur pour aligner le texte
  },
  eventDate: { 
    color: 'rgba(255,255,255,0.9)', 
    fontSize: 12, 
    marginBottom: 2,
    fontFamily: Fonts.medium
  },
  eventTitle: { 
    color: Colors.blanc, 
    fontSize: 16, 
    fontFamily: Fonts.medium,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // --- BANNIÈRE MAP ---
  mapBanner: {
    margin: 20,
    backgroundColor: Colors.noir,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapBannerContent: { flex: 1 },
  mapBannerTitle: { color: Colors.blanc, fontSize: 18, fontFamily: Fonts.titre },
  mapBannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  mapBannerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- CATÉGORIES & CLUBS ---
  categoriesScroll: { paddingLeft: 20, marginTop: 16 },
  categoryCard: { marginRight: 20, alignItems: 'center' },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.noir },
  recomendedContainer: { paddingHorizontal: 20, marginTop: 16, paddingBottom: 32 },
  clubInfo: { padding: 12 },
  clubName: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  clubLocation: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, marginLeft: 4 },
  // --- NEW STYLES ---
  loginBanner: {
    marginHorizontal: 20,
    backgroundColor: Colors.bleuClair,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    marginTop: 16,
  },
  loginBannerTitle: { color: Colors.noir, fontFamily: Fonts.medium, marginBottom: 12 },
  loginBannerActions: { flexDirection: 'row', gap: 8 },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.grisClair, marginHorizontal: 4 },
  activeDot: { backgroundColor: Colors.noir },
  clubGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  clubGridItem: { width: '48%' },
});