import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
// Tes imports
import ClubsTab from "./ClubsTab";
import EventsTab from "./EventsTabs";
import FilterBottomSheet from "../../../components/search/FilterModal";
import { useSearch } from "../../../components/search/useSearch";
import { useLocalSearchParams } from 'expo-router';
import { Colors } from "@/constants/colors";
import { Radius, Shadow } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Tabs from "@/components/ui/Tabs";
import Input from "@/components/ui/Input";

type SearchTab = "Clubs" | "Événements";

export default function SearchScreen() {
  const { q, tab } = useLocalSearchParams<{ q?: string, tab?: string }>();
  const [activeTab, setActiveTab] = useState<SearchTab>(tab === "Événements" ? "Événements" : "Clubs");
  const [query, setQuery] = useState(q || "");
  const [debouncedQuery, setDebouncedQuery] = useState(q || "");
  const [radius, setRadius] = useState(30);
  const [selectedSort, setSelectedSort] = useState("Plus pertinent");
  const [useRadius, setUseRadius] = useState(false);
  const [sportQuery, setSportQuery] = useState("");
  const [eventType, setEventType] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (q) {
      setQuery(q);
      setDebouncedQuery(q);
    }
  }, [q]);

  const router = useRouter();
  // Récupération des données
  const { clubs, events, loading, loadingMore, refresh, fetchMoreEvents } = useSearch(
    debouncedQuery,
    radius,
    useRadius,
    "",
    undefined,
    sportQuery,
    eventType
  );
  
  const upcomingEvents = useMemo(() => {
  const now = new Date();

  return (events || []).filter((event) => {
    if (!event.starts_at) return false;

    return new Date(event.starts_at) >= now;
  });
}, [events]);

  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = radius !== 30 || !!sportQuery.trim() || useRadius || !!eventType;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.fond }}>
      
      {/* HEADER DE RECHERCHE */}
      <View style={styles.headerArea}>
        <Input
          accessibilityLabel="Rechercher"
          placeholder="Rechercher"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          leading={<Icon name="search" size={20} color={Colors.gris} />}
          trailing={
            query.length > 0 ? (
              <IconButton
                name="close-circle"
                variant="fantome"
                color={Colors.gris}
                accessibilityLabel="Effacer la recherche"
                onPress={() => setQuery("")}
                style={{ width: 32, height: 32 }}
              />
            ) : null
          }
        />
      </View>

      {/* TABS NAVIGATION */}
      <Tabs
        style={styles.tabBar}
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "Clubs", label: `Clubs (${clubs?.length || 0})` },
          { value: "Événements", label: `Événements (${upcomingEvents?.length || 0})` },
        ]}
      />

      {activeTab === "Clubs" ? (
        <ClubsTab data={clubs} refreshing={loading} onRefresh={refresh} />
      ) : (
        <EventsTab data={upcomingEvents} refreshing={loading} onRefresh={refresh} onEndReached={fetchMoreEvents} loadingMore={loadingMore} />
      )}

      {/* BOUTONS FLOTTANTS (FABs) */}
      <View style={styles.fabContainer}>
        {/* BOUTON FILTRES */}
        <View>
          <Button
            label="Filtres"
            icon="options-outline"
            variant="secondaire"
            style={styles.fabWhite}
            onPress={() => setShowFilters(true)}
            accessibilityHint={hasActiveFilters ? "Des filtres sont actifs" : undefined}
          />
          {hasActiveFilters && <View style={styles.badge} pointerEvents="none" />}
        </View>

        {/* BOUTON CARTE */}
        <Button
          label="Carte"
          icon="map-outline"
          style={styles.fabBlue}
          onPress={() => router.push('/(main)/search/map')}
        />
      </View>

      {/* OVERLAY FILTRES */}
      <FilterBottomSheet 
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        radius={radius}
        setRadius={setRadius}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        useRadius={useRadius}
        setUseRadius={setUseRadius}
        sportQuery={sportQuery}
        setSportQuery={setSportQuery}
        eventType={eventType}
        setEventType={setEventType}
        onReset={() => {
          setRadius(30);
          setUseRadius(false);
          setSportQuery("");
          setEventType("");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerArea: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 16,
    backgroundColor: Colors.fond,
  },
  tabBar: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 12,
    zIndex: 0,
  },
  fabWhite: {
    backgroundColor: Colors.blanc,
    borderRadius: Radius.full,
    ...Shadow.flottante,
  },
  fabBlue: {
    borderRadius: Radius.full,
    ...Shadow.flottante,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.rouge,
    borderWidth: 2,
    borderColor: Colors.blanc,
  }
});