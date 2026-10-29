import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useLocation } from "@/context/LocationContext";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import { ClubSearchItem, EventSearchItem } from "./types";

const DEFAULT_REGION: Region = {
  latitude: 48.692,
  longitude: 6.184,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const toRegion = (c: { latitude: number; longitude: number }): Region => ({
  latitude: c.latitude,
  longitude: c.longitude,
  latitudeDelta: DEFAULT_REGION.latitudeDelta,
  longitudeDelta: DEFAULT_REGION.longitudeDelta,
});

interface Props {
  clubs: ClubSearchItem[];
  events: EventSearchItem[];
  loading: boolean;
  onSearchZone: (zone: { latitude: number; longitude: number; radius: number }) => void;
  onSelectionChange?: (open: boolean) => void;
}

export default function SearchMapView({ clubs, events, loading, onSearchZone, onSelectionChange }: Props) {
  const router = useRouter();
  const { location, status } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(() => (location ? toRegion(location) : DEFAULT_REGION));
  const [mapReady, setMapReady] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState<{ kind: "club"; item: ClubSearchItem } | { kind: "event"; item: EventSearchItem } | null>(null);

  const selectedAt = useRef(0);

  useEffect(() => {
    onSelectionChange?.(!!selected);
  }, [selected]);

  const select = (s: NonNullable<typeof selected>) => {
    selectedAt.current = Date.now();
    setSelected(s);
    const lat = parseFloat(s.item.latitude);
    const lng = parseFloat(s.item.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current?.animateToRegion({ ...region, latitude: lat - region.latitudeDelta * 0.2, longitude: lng }, 300);
    }
  };

  const previews = useMemo(
    () => [
      ...clubs.map((c) => ({ kind: "club" as const, item: c })),
      ...events.map((e) => ({ kind: "event" as const, item: e })),
    ].slice(0, 20),
    [clubs, events],
  );

  const recenterOnUser = async () => {
    try {
      setLocating(true);
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        Alert.alert("Géolocalisation", "Autorise la localisation pour te recentrer sur ta position.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = toRegion(pos.coords);
      mapRef.current?.animateToRegion(next, 400);
      setRegion(next);
    } catch {
      Alert.alert("Géolocalisation", "Impossible de récupérer ta position.");
    } finally {
      setLocating(false);
    }
  };

  const handleSearchHere = () => {
    const radius = Math.min(Math.max(Math.round(((region.latitudeDelta * 111) / 2) * 1.2), 1), 1000);
    onSearchZone({ latitude: region.latitude, longitude: region.longitude, radius });
    setShowSearchButton(false);
  };

  const imageOf = (p: (typeof previews)[number]) =>
    p.kind === "club" ? p.item.image || p.item.banner : p.item.coverImagePath || p.item.image;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        onPress={() => {
          // Un appui sur un marqueur peut aussi déclencher onPress de la carte
          if (Date.now() - selectedAt.current > 500) setSelected(null);
        }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          setShowSearchButton(true);
        }}
        showsUserLocation={status === "granted"}
        showsMyLocationButton={false}
      >
        {clubs.map((club) => (
          <Marker
            key={`club-${club.id}`}
            coordinate={{ latitude: parseFloat(club.latitude), longitude: parseFloat(club.longitude) }}
            onPress={() => select({ kind: "club", item: club })}
          >
            <View style={styles.markerShadow}>
              <View style={[styles.marker, { backgroundColor: Colors.bleu }]}>
                <Icon name="people-circle-outline" size={25} color={Colors.blanc} />
              </View>
            </View>
          </Marker>
        ))}

        {events.map((event) => (
          <Marker
            key={`event-${event.id}`}
            coordinate={{ latitude: parseFloat(event.latitude), longitude: parseFloat(event.longitude) }}
            onPress={() => select({ kind: "event", item: event })}
          >
            <View style={styles.markerShadow}>
              <View style={[styles.marker, { backgroundColor: Colors.rouge, borderRadius: 8 }]}>
                <Icon name="medal-outline" size={25} color={Colors.blanc} />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {!mapReady && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.noir} />
        </View>
      )}

      {showSearchButton && (
        <TouchableOpacity style={styles.searchHereBtn} onPress={handleSearchHere} disabled={loading} activeOpacity={0.9}>
          <Icon name={loading ? "hourglass-outline" : "refresh"} size={18} color={Colors.noir} />
          <Text style={styles.searchHereText}>{loading ? "Chargement..." : "Rechercher dans cette zone"}</Text>
        </TouchableOpacity>
      )}

      {!selected && (
      <TouchableOpacity
        style={styles.fabLocation}
        onPress={recenterOnUser}
        activeOpacity={0.8}
        accessibilityLabel="Me recentrer sur ma position"
      >
        {locating ? <ActivityIndicator color={Colors.blanc} /> : <Icon name="locate-outline" size={24} color={Colors.blanc} />}
      </TouchableOpacity>
      )}

      {!selected && previews.length > 0 && (
        <FlatList
          style={styles.previewList}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={previews}
          keyExtractor={(p) => `${p.kind}-${p.item.id}`}
          renderItem={({ item: p }) => {
            const uri = imageOf(p);
            return (
              <TouchableOpacity
                style={styles.previewCard}
                activeOpacity={0.9}
                onPress={() => select(p)}
              >
                {uri ? <Image source={{ uri }} style={styles.previewImage} /> : <View style={[styles.previewImage, { backgroundColor: Colors.grisClair }]} />}
                <View style={styles.previewBody}>
                  <View style={p.kind === "club" ? styles.tagClub : styles.tagEvent}>
                    <Text style={styles.tagText}>{p.kind === "club" ? "Club" : "Événement"}</Text>
                  </View>
                  <Text style={styles.previewTitle} numberOfLines={1}>{p.item.name}</Text>
                  <View style={styles.row}>
                    <Icon name="location" size={12} color={Colors.grisTexte} />
                    <Text style={styles.previewCity} numberOfLines={1}>{p.item.city}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {selected && (
        <View style={styles.drawer}>
          <View style={styles.drawerHandle} />
          <TouchableOpacity style={styles.drawerClose} onPress={() => setSelected(null)} accessibilityLabel="Fermer">
            <Icon name="close" size={20} color={Colors.noir} />
          </TouchableOpacity>
          <View style={styles.drawerRow}>
            {(() => {
              const uri = imageOf(selected);
              return uri ? (
                <Image source={{ uri }} style={styles.drawerImage} />
              ) : (
                <View style={[styles.drawerImage, { backgroundColor: Colors.grisClair }]} />
              );
            })()}
            <View style={{ flex: 1, gap: 4, paddingRight: 24 }}>
              <View style={selected.kind === "club" ? styles.tagClub : styles.tagEvent}>
                <Text style={styles.tagText}>{selected.kind === "club" ? "Club" : "Événement"}</Text>
              </View>
              <Text style={styles.drawerTitle} numberOfLines={2}>{selected.item.name}</Text>
              <View style={styles.row}>
                <Icon name="location" size={14} color={Colors.grisTexte} />
                <Text style={styles.previewCity} numberOfLines={1}>
                  {[selected.item.street, selected.item.city].filter(Boolean).join(", ")}
                </Text>
              </View>
              <Text style={styles.previewCity} numberOfLines={1}>
                {[selected.item.sport, typeof selected.item.distanceInKm === "number" ? `${Math.round(selected.item.distanceInKm)} km` : null].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.drawerBtn}
            activeOpacity={0.85}
            onPress={() => router.push(selected.kind === "club" ? `/search/club/${selected.item.id}` : `/search/event/${selected.item.id}`)}
          >
            <Text style={styles.drawerBtnText}>{selected.kind === "club" ? "Voir la fiche du club" : "Voir l'événement"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: Colors.fond },
  markerShadow: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  marker: { borderRadius: 16, borderWidth: 2, borderColor: Colors.blanc, alignItems: "center", justifyContent: "center" },
  callout: { width: 190, backgroundColor: Colors.blanc, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: Colors.grisClair },
  calloutTitle: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.noir },
  calloutSub: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.grisTexte, marginTop: 2 },
  calloutLink: { fontFamily: Fonts.medium, fontSize: 12, marginTop: 8, textAlign: "right" },
  searchHereBtn: {
    position: "absolute", top: 16, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.blanc, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.grisClair, elevation: 4,
  },
  searchHereText: { color: Colors.noir, fontFamily: Fonts.medium, fontSize: 14 },
  fabLocation: {
    position: "absolute", bottom: 212, right: 20, width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center", backgroundColor: Colors.noir, elevation: 6,
  },
  previewList: { position: "absolute", bottom: 20, left: 0, right: 0 },
  previewCard: {
    width: 280, flexDirection: "row", backgroundColor: Colors.blanc, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.grisClair,
  },
  previewImage: { width: 92, height: 100 },
  previewBody: { flex: 1, padding: 12, gap: 4, justifyContent: "center" },
  previewTitle: { fontFamily: Fonts.medium, fontSize: 16, color: Colors.noir },
  previewCity: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.grisTexte, flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  drawer: {
    position: "absolute", bottom: 16, left: 16, right: 16, backgroundColor: Colors.blanc, borderRadius: 24,
    zIndex: 30,
    padding: 16, paddingTop: 20, gap: 16, borderWidth: 1, borderColor: Colors.grisClair, elevation: 8,
    shadowColor: Colors.noir, shadowOpacity: 0.12, shadowRadius: 16,
  },
  drawerHandle: { position: "absolute", top: 8, alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.grisClair },
  drawerClose: { position: "absolute", top: 12, right: 12, width: 32, height: 32, alignItems: "center", justifyContent: "center", zIndex: 1 },
  drawerRow: { flexDirection: "row", gap: 12 },
  drawerImage: { width: 88, height: 88, borderRadius: 16 },
  drawerTitle: { fontFamily: Fonts.titre, fontSize: 18, color: Colors.noir },
  drawerBtn: { height: 48, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: Colors.noir },
  drawerBtnText: { color: Colors.blanc, fontFamily: Fonts.medium, fontSize: 16 },
  tagClub: { alignSelf: "flex-start", backgroundColor: Colors.bleuClair, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tagEvent: { alignSelf: "flex-start", backgroundColor: Colors.rougeClair, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tagText: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.noir },
});
