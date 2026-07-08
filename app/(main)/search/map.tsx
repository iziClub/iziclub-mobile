import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSearch } from '../../../components/search/useSearch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const router = useRouter();

  const [region, setRegion] = useState({
    latitude: 48.692,
    longitude: 6.184,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [searchParams, setSearchParams] = useState({
    latitude: 48.692,
    longitude: 6.184,
    radius: 30,
  });

  const [showSearchButton, setShowSearchButton] = useState(false);

  const { clubs, events, loading } = useSearch("", searchParams.radius, true, "", {
    latitude: searchParams.latitude,
    longitude: searchParams.longitude,
  });

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

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          setShowSearchButton(true);
        }}
        showsUserLocation={true}
      >
        {/* --- RENDU DES CLUBS --- */}
        {clubs.map((club: any) => (
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
        {events && events.map((event: any) => (
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
  container: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  
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

  // FAB Buttons
  searchHereBtn: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
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