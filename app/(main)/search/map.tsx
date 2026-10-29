import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useFocusEffect, useRouter } from 'expo-router';
import { useLocation } from '@/context/LocationContext';
import { useSearch } from '../../../components/search/useSearch';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

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

  const upcomingEvents = useMemo(() => {
    const now = new Date();
  
    return (events || []).filter((event) => {
      if (!event.starts_at) return false;
  
      return new Date(event.starts_at) >= now;
    });
  }, [events]);

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
  const visibleEvents = useMemo(() => (showEvents ? upcomingEvents ?? [] : []), [showEvents, upcomingEvents]);

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
              <View style={[styles.customMarkerVisual, { backgroundColor: Colors.bleu }]}>
                <Icon name="people-circle-outline" size={25} color={Colors.blanc} />
              </View>
            </View>

            <Callout tooltip onPress={() => router.push(`/search/club/${club.id}`)}>
              <View style={styles.calloutWrapper}>
                <View style={styles.calloutCard}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{club.name}</Text>
                  <View style={styles.tagBadgeClub}><Text style={styles.tagTextClub}>Club</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.addressRow}>
                    <Icon name="location" size={12} color={Colors.bleu} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {club.city} {club.street ? `- ${club.street}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.moreInfo, { color: Colors.bleu }]}>Voir la fiche →</Text>
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
              <View style={[styles.customMarkerVisual, { backgroundColor: Colors.rouge, borderRadius: 8 }]}>
                <Icon name="medal-outline" size={25} color={Colors.blanc} />
              </View>
            </View>

            <Callout tooltip onPress={() => router.push(`/search/event/${event.id}`)}>
              <View style={styles.calloutWrapper}>
                <View style={styles.calloutCard}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{event.name}</Text>
                  <View style={styles.tagBadgeEvent}><Text style={styles.tagTextEvent}>Événement</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.addressRow}>
                    <Icon name="location" size={12} color={Colors.rouge} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {event.city} {event.street ? `- ${event.street}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.moreInfo, { color: Colors.rouge }]}>Voir l'événement →</Text>
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
          <ActivityIndicator size="large" color={Colors.noir} />
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
            <Icon
              name={loading ? "hourglass-outline" : "refresh"}
              size={18}
              color={Colors.noir}
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
            <Icon 
              name={showClubs ? "people-circle" : "people-circle-outline"} 
              size={16} 
              color={showClubs ? Colors.blanc : Colors.gris} 
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
            <Icon 
              name={showEvents ? "medal" : "medal-outline"} 
              size={16} 
              color={showEvents ? Colors.blanc : Colors.gris} 
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
        <Icon name="locate-outline" size={22} color={Colors.noir} />
      </TouchableOpacity>

      {/* Bouton Retour Liste */}
      <TouchableOpacity
        style={styles.fabList}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Icon name="list" size={24} color={Colors.noir} />
        <Text style={styles.fabText}>Liste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  map: { ...StyleSheet.absoluteFill },

  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.fond,
  },

  // Nouveau conteneur pour empiler proprement les éléments du haut sans chevauchement
  topControlsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
  },

  searchHereBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blanc,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 999,
    elevation: 4,
    shadowColor: Colors.noir,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  searchHereText: { marginLeft: 8, color: Colors.noir, fontFamily: Fonts.medium, fontSize: 14 },

  // Styles de la barre de filtres
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.blanc,
    padding: 4,
    borderRadius: 999,
    elevation: 4,
    shadowColor: Colors.noir,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 8,
  },
  filterButtonClubActive: {
    backgroundColor: Colors.noir,
  },
  filterButtonEventActive: {
    backgroundColor: Colors.noir,
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  filterTextActive: {
    color: Colors.blanc,
  },
  filterTextInactive: {
    color: Colors.grisTexte,
  },

  markerShadowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.noir,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  customMarkerVisual: {
    padding: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blanc,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Callouts
  calloutWrapper: {
    alignItems: 'center',
    width: 190,
  },
  calloutCard: {
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    padding: 12,
    width: '100%',
    shadowColor: Colors.noir,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  clubTitle: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.noir, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.grisClair, marginBottom: 8, marginTop: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, marginLeft: 4, textTransform: 'capitalize', flex: 1 },
  moreInfo: { fontSize: 12, fontFamily: Fonts.medium, marginTop: 8, textAlign: 'right' },
  
  tagBadgeClub: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bleuClair,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagBadgeEvent: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.rougeClair,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagTextClub: { fontSize: 12,fontFamily: Fonts.medium, color: Colors.noir },
  tagTextEvent: { fontSize: 12,fontFamily: Fonts.medium, color: Colors.noir },
  
  arrow: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.blanc,
    marginTop: -1,
  },

  fabLocation: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    backgroundColor: Colors.blanc,
    padding: 12,
    borderRadius: 999,
    elevation: 4,
    shadowColor: Colors.noir,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  fabList: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blanc,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    elevation: 4,
    shadowColor: Colors.noir,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  fabText: { marginLeft: 8, fontFamily: Fonts.medium, fontSize: 16, color: Colors.noir },
});