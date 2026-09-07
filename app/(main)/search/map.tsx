import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/context/LocationContext';
import { useSearch } from '../../../components/search/useSearch';

const DEFAULT_REGION: Region = {
  latitude: 48.692,
  longitude: 6.184,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const toRegion = (coords: { latitude: number; longitude: number }): Region => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  latitudeDelta: DEFAULT_REGION.latitudeDelta,
  longitudeDelta: DEFAULT_REGION.longitudeDelta,
});

export default function MapScreen() {
  const router = useRouter();
  const { location, status, requestLocation } = useLocation();

  // États pour la carte et la recherche : on part de la position de l'utilisateur si elle est
  // déjà connue (résolue au lancement de l'app), sinon on retombe sur la région par défaut.
  const [region, setRegion] = useState<Region>(() => (location ? toRegion(location) : DEFAULT_REGION));

  const [searchParams, setSearchParams] = useState(() => ({
    latitude: location?.latitude ?? DEFAULT_REGION.latitude,
    longitude: location?.longitude ?? DEFAULT_REGION.longitude,
    radius: 30,
  }));

  const [showSearchButton, setShowSearchButton] = useState(false);

  // --- NOUVEAUX ÉTATS POUR LES FILTRES ---
  const [showClubs, setShowClubs] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Si la position était déjà connue au montage, inutile de la recentrer une seconde fois.
  const hasCenteredOnUser = useRef(!!location);
  const mapRef = useRef<MapView>(null);

  const { clubs, events, loading } = useSearch("", searchParams.radius, true, "", {
    latitude: searchParams.latitude,
    longitude: searchParams.longitude,
  });

  // Centre la carte sur l'utilisateur dès que sa position est connue (si elle n'était pas
  // encore disponible au montage de l'écran)
  React.useEffect(() => {
    if (location && !hasCenteredOnUser.current) {
      hasCenteredOnUser.current = true;
      const nextRegion = toRegion(location);
      setRegion(nextRegion);
      setSearchParams(prev => ({ ...prev, latitude: location.latitude, longitude: location.longitude }));
      mapRef.current?.animateToRegion(nextRegion, 400);
    }
  }, [location]);

  // Demande la géolocalisation à l'arrivée sur l'écran
  useFocusEffect(
    useCallback(() => {
      if (status === 'idle') {
        requestLocation();
      }
    }, [status, requestLocation])
  );

  const handleSearchHere = () => {
    const calculatedRadius = Math.round((region.latitudeDelta * 111) / 2 * 1.2);
    const finalRadius = Math.min(Math.max(calculatedRadius, 1), 1000);

    setSearchParams({
      latitude: region.latitude,
      longitude: region.longitude,
      radius: finalRadius,
    });

    setShowSearchButton(false);
  };

  const handleRequestLocation = async () => {
    const granted = await requestLocation();
    if (!granted) {
      Alert.alert('Géolocalisation', 'La géolocalisation n’a pas été autorisée. Les résultats seront affichés autour de Paris par défaut.');
    }
  };

  // Gestion intelligente des filtres pour éviter d'avoir 0 filtre sélectionné
  const toggleFilter = (type: 'clubs' | 'events') => {
    if (type === 'clubs') {
      if (showClubs && !showEvents) {
        // Si on désactive les clubs alors que les événements sont déjà masqués, on active les événements
        setShowClubs(false);
        setShowEvents(true);
      } else {
        setShowClubs(!showClubs);
      }
    } else {
      if (showEvents && !showClubs) {
        // Si on désactive les événements alors que les clubs sont déjà masqués, on active les clubs
        setShowEvents(false);
        setShowClubs(true);
      } else {
        setShowEvents(!showEvents);
      }
    }
  };

  // Apple Maps par défaut sur iOS (Google Maps y nécessite une clé API dédiée et n'est pas
  // disponible tel quel dans Expo Go). Google Maps par défaut sur Android.
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  const visibleClubs = useMemo(() => (showClubs ? clubs ?? [] : []), [showClubs, clubs]);
  const visibleEvents = useMemo(() => (showEvents ? events ?? [] : []), [showEvents, events]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={styles.map}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          setShowSearchButton(true);
        }}
        showsUserLocation={status === 'granted'}
        showsMyLocationButton={false}
      >
        {/* --- RENDU DES CLUBS --- */}
        {visibleClubs.map((club: any) => (
          <Marker
            key={`club-${club.id}`}
            coordinate={{
              latitude: parseFloat(club.latitude),
              longitude: parseFloat(club.longitude)
            }}
          >
            <View style={styles.markerShadowContainer}>
              <View style={[styles.customMarkerVisual, { backgroundColor: '#4A78FF' }]}>
                <Ionicons name="people-circle-outline" size={25} color="white" />
              </View>
            </View>

            <Callout tooltip onPress={() => router.push(`/search/club/${club.id}`)}>
              <View style={styles.calloutWrapper}>
                <View style={styles.calloutCard}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{club.name}</Text>
                  <View style={styles.tagBadgeClub}><Text style={styles.tagText}>Club</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.addressRow}>
                    <Ionicons name="location" size={12} color="#4A78FF" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {club.city} {club.street ? `- ${club.street}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.moreInfo, { color: '#4A78FF' }]}>Voir la fiche →</Text>
                </View>
                <View style={styles.arrow} />
              </View>
            </Callout>
          </Marker>
        ))}

        {/* --- RENDU DES ÉVÉNEMENTS --- */}
        {visibleEvents.map((event: any) => (
          <Marker
            key={`event-${event.id}`}
            coordinate={{
              latitude: parseFloat(event.latitude),
              longitude: parseFloat(event.longitude)
            }}
          >
            <View style={styles.markerShadowContainer}>
              <View style={[styles.customMarkerVisual, { backgroundColor: '#FF6B6B', borderRadius: 8 }]}>
                <Ionicons name="medal-outline" size={25} color="white" />
              </View>
            </View>

            <Callout tooltip onPress={() => router.push(`/search/event/${event.id}`)}>
              <View style={styles.calloutWrapper}>
                <View style={styles.calloutCard}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{event.name}</Text>
                  <View style={styles.tagBadgeEvent}><Text style={styles.tagText}>Événement</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.addressRow}>
                    <Ionicons name="location" size={12} color="#FF6B6B" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {event.city} {event.street ? `- ${event.street}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.moreInfo, { color: '#FF6B6B' }]}>Voir l'événement →</Text>
                </View>
                <View style={styles.arrow} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Indicateur pendant l'initialisation native de la carte */}
      {!mapReady && (
        <View style={styles.mapLoadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#4A78FF" />
        </View>
      )}

      {/* --- CONTENEUR DES BOUTONS DE HAUT D'ÉCRAN --- */}
      <View style={styles.topControlsContainer}>
        {/* Bouton "Rechercher ici" */}
        {showSearchButton && (
          <TouchableOpacity
            style={styles.searchHereBtn}
            onPress={handleSearchHere}
            activeOpacity={0.9}
            disabled={loading}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "refresh"}
              size={18}
              color="#4A78FF"
            />
            <Text style={styles.searchHereText}>
              {loading ? "Chargement..." : "Rechercher dans cette zone"}
            </Text>
          </TouchableOpacity>
        )}

        {/* BARRE DE FILTRES UI/UX */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showClubs ? styles.filterButtonClubActive : styles.filterButtonInactive
            ]}
            onPress={() => toggleFilter('clubs')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={showClubs ? "people-circle" : "people-circle-outline"} 
              size={16} 
              color={showClubs ? "white" : "#8E8E93"} 
            />
            <Text style={[styles.filterText, showClubs ? styles.filterTextActive : styles.filterTextInactive]}>
              Clubs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              showEvents ? styles.filterButtonEventActive : styles.filterButtonInactive
            ]}
            onPress={() => toggleFilter('events')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={showEvents ? "medal" : "medal-outline"} 
              size={16} 
              color={showEvents ? "white" : "#8E8E93"} 
            />
            <Text style={[styles.filterText, showEvents ? styles.filterTextActive : styles.filterTextInactive]}>
              Événements
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bouton Géolocalisation */}
      <TouchableOpacity
        style={styles.fabLocation}
        onPress={handleRequestLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="locate-outline" size={22} color="#4A78FF" />
      </TouchableOpacity>

      {/* Bouton Retour Liste */}
      <TouchableOpacity
        style={styles.fabList}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={24} color="black" />
        <Text style={styles.fabText}>Liste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  map: { ...StyleSheet.absoluteFill },

  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },

  // Nouveau conteneur pour empiler proprement les éléments du haut sans chevauchement
  topControlsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12, // Crée un espace propre entre le bouton refresh et les filtres
  },

  searchHereBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  searchHereText: { marginLeft: 8, color: '#4A78FF', fontWeight: '600', fontSize: 13 },

  // Styles de la barre de filtres
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 4,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 6,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 6,
  },
  filterButtonClubActive: {
    backgroundColor: '#4A78FF',
  },
  filterButtonEventActive: {
    backgroundColor: '#FF6B6B',
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  filterTextInactive: {
    color: '#8E8E93',
  },

  markerShadowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  customMarkerVisual: {
    padding: 0,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Callouts
  calloutWrapper: {
    alignItems: 'center',
    width: 190,
  },
  calloutCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  clubTitle: { fontWeight: '700', fontSize: 14, color: '#1C1C1E', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginBottom: 8, marginTop: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 11, color: '#8E8E93', marginLeft: 4, textTransform: 'capitalize', flex: 1 },
  moreInfo: { fontSize: 11, fontWeight: '700', marginTop: 8, textAlign: 'right' },
  
  tagBadgeClub: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8EFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeEvent: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: { fontSize: 9, fontWeight: '700', color: '#3A3A3C' },
  
  arrow: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'white',
    marginTop: -1,
  },

  fabLocation: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 999,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fabList: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fabText: { marginLeft: 8, fontWeight: '700', fontSize: 15 },
});