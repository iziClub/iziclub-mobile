import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSearch } from '../../../components/search/useSearch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const router = useRouter();

  // 1. Position "visuelle" (ce que l'utilisateur regarde actuellement)
  const [region, setRegion] = useState({
    latitude: 48.692,
    longitude: 6.184,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // 2. Paramètres effectifs de la recherche API
  const [searchParams, setSearchParams] = useState({
    latitude: 48.692,
    longitude: 6.184,
    radius: 30, // Rayon par défaut au démarrage
  });

  const [showSearchButton, setShowSearchButton] = useState(false);

  // Appel API lié aux searchParams (déclenché seulement quand on clique sur le bouton)
  const { clubs, events, loading } = useSearch("", searchParams.radius, true, "", {
    latitude: searchParams.latitude,
    longitude: searchParams.longitude,
  });
  // Fonction pour calculer le radius et lancer la recherche
  const handleSearchHere = () => {
    /**
     * CALCUL DU RADIUS :
     * 1 degré de latitude ≈ 111 km.
     * On prend le delta affiché, on le multiplie par 111 pour avoir la hauteur en km.
     * On divise par 2 pour avoir le rayon depuis le centre.
     * On multiplie par 1.2 (marge de 20%) pour couvrir les coins du rectangle de l'écran.
     */
    const calculatedRadius = Math.round((region.latitudeDelta * 111) / 2 * 1.2);

    // Sécurité : minimum 1km, maximum 100km pour ne pas surcharger l'API
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
          // On affiche le bouton dès que la carte s'arrête de bouger
          setShowSearchButton(true);
        }}
        showsUserLocation={true}
      >
        {clubs.map((club: any) => (
          <Marker
            key={club.id}
            coordinate={{
              latitude: parseFloat(club.profile.latitude),
              longitude: parseFloat(club.profile.longitude)
            }}
          >
            {/* La pastille (Marker) */}
            <View style={styles.markerShadowContainer}>
              {/* Le Marker visuel à l'intérieur */}
              <View style={styles.customMarkerVisual}>
                <Ionicons name="trophy" size={16} color="white" />
              </View>
            </View>

            {/* LE CALLOUT (Infos au clic) - Ne pas enlever */}
            <Callout tooltip onPress={() => router.push(`/search/club/${club.id}`)}>
              <View style={styles.calloutWrapper}>
                <View style={styles.calloutCard}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{club.name}</Text>

                  <View style={styles.divider} />

                  <View style={styles.addressRow}>
                    <Ionicons name="location" size={12} color="#4A78FF" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {club.city} {club.street ? `- ${club.street}` : ''}
                    </Text>
                  </View>

                  <Text style={styles.moreInfo}>Voir les détails →</Text>
                </View>
                <View style={styles.arrow} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bouton "Rechercher ici" avec indicateur de chargement */}
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
    // Dimensions exactes du marker final (padding + icon size + borders)
    // Ici, basé sur padding 8 + icon 16 + borders 2 ≈ 36-40px
    width: 36,
    height: 36,
    borderRadius: 18, // Indispensable pour l'ombre arrondie sur Android
    backgroundColor: 'transparent', // Pour ne pas masquer le marker

    // Ombre pour iOS (Shadow Props)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 3.5,

    // Ombre pour Android (Elevation)
    // On l'applique sur le container, pas sur le marker lui-même
    elevation: 6,

    // Centrage du contenu
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Le Marker visuel (sans elevation ni shadow props)
  customMarkerVisual: {
    backgroundColor: '#4A78FF',
    padding: 8,
    borderRadius: 20, // Reste rond
    borderWidth: 2,
    borderColor: 'white',
    // On enlève elevation et shadowColor d'ici !
  },
  // Marker (Pastille)
  customMarker: {
    backgroundColor: '#4A78FF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Callout (Bulle d'info)
  calloutWrapper: {
    alignItems: 'center',
    width: 180,
  },
  calloutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  clubTitle: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 10, color: '#888', marginLeft: 4, textTransform: 'capitalize' },
  moreInfo: { fontSize: 10, color: '#4A78FF', fontWeight: 'bold', marginTop: 8, textAlign: 'right' },
  arrow: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'white',
    marginTop: -1,
  },

  // FAB "Rechercher ici"
  searchHereBtn: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  searchHereText: { marginLeft: 8, color: '#4A78FF', fontWeight: '600', fontSize: 13 },

  // FAB Liste
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
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabText: { marginLeft: 8, fontWeight: 'bold', fontSize: 16 },
});