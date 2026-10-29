import React, { useState, useEffect, useMemo } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
// Tes imports
import ClubsTab from "./ClubsTab";
import EventsTab from "./EventsTabs";
import FilterBottomSheet from "../../../components/search/FilterModal";
import { useSearch } from "../../../components/search/useSearch";
import { useLocalSearchParams } from 'expo-router';
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

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
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Rechercher"
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={Colors.gris}
            style={{ flex: 1, fontSize: 16, fontFamily: Fonts.regular, color: Colors.noir }}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")}>
               <Icon name="close-circle" size={20} color={Colors.gris} />
            </TouchableOpacity>
          ) : (
            <Icon name="search" size={20} color={Colors.gris} />
          )}
        </View>
      </View>

      {/* TABS NAVIGATION */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("Clubs")}
        >
          <Text style={[styles.tabLabel, activeTab === "Clubs" && styles.tabLabelActive]}>
            Clubs ({clubs?.length || 0})
          </Text>
          {activeTab === "Clubs" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("Événements")}
        >
          <Text style={[styles.tabLabel, activeTab === "Événements" && styles.tabLabelActive]}>
            Événements ({upcomingEvents?.length || 0})
          </Text>
          {activeTab === "Événements" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {activeTab === "Clubs" ? (
        <ClubsTab data={clubs} refreshing={loading} onRefresh={refresh} />
      ) : (
        <EventsTab data={upcomingEvents} refreshing={loading} onRefresh={refresh} onEndReached={fetchMoreEvents} loadingMore={loadingMore} />
      )}

      {/* BOUTONS FLOTTANTS (FABs) */}
      <View style={styles.fabContainer}>
        {/* BOUTON FILTRES */}
        <TouchableOpacity 
          style={styles.fabWhite} 
          onPress={() => setShowFilters(true)}
        >
          <Icon name="options-outline" size={20} color={Colors.noir} />
          <Text style={styles.fabTextBlack}>Filtres</Text>
          {hasActiveFilters && <View style={styles.badge} />}
        </TouchableOpacity>

        {/* BOUTON CARTE */}
        <TouchableOpacity 
          style={styles.fabBlue}
          onPress={() => router.push('/(main)/search/map')}
        >
          <Text style={styles.fabTextWhite}>Carte</Text>
          <Icon name="map-outline" size={20} color={Colors.blanc} />
        </TouchableOpacity>
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
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grisClair,
    backgroundColor: Colors.fond,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.grisTexte,
  },
  tabLabelActive: {
    color: Colors.noir,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: Colors.noir,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: Colors.blanc,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grisClair,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blanc,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  fabBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.noir,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  fabTextBlack: { 
    marginLeft: 8, 
    fontFamily: Fonts.medium, 
    fontSize: 16,
    color: Colors.noir,
  },
  fabTextWhite: { 
    marginRight: 8, 
    fontFamily: Fonts.medium, 
    fontSize: 16, 
    color: Colors.blanc,
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