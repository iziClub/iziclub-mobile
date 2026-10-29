import React, { useState, useEffect, useMemo } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FilterBottomSheet from "../../../components/search/FilterModal";
import { useSearch } from "../../../components/search/useSearch";
import ResultsList from "../../../components/search/ResultsList";
import SearchMapView from "../../../components/search/SearchMapView";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

type ViewMode = "list" | "map";
type Zone = { latitude: number; longitude: number; radius: number };

export default function SearchScreen() {
  const { q, tab, view } = useLocalSearchParams<{ q?: string; tab?: string; view?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>(view === "map" ? "map" : "list");
  const [showClubs, setShowClubs] = useState(tab !== "Événements");
  const [showEvents, setShowEvents] = useState(tab !== "Clubs");
  const [query, setQuery] = useState(q || "");
  const [debouncedQuery, setDebouncedQuery] = useState(q || "");
  const [radius, setRadius] = useState(30);
  const [selectedSort, setSelectedSort] = useState("Plus pertinent");
  const [useRadius, setUseRadius] = useState(false);
  const [sportQuery, setSportQuery] = useState("");
  const [eventType, setEventType] = useState("");
  const [zone, setZone] = useState<Zone | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    if (view === "map") setViewMode("map");
  }, [view]);

  useEffect(() => {
    if (viewMode === "list") setZone(null);
  }, [viewMode]);

  const { clubs, events, loading, loadingMore, refresh, fetchMoreEvents } = useSearch(
    debouncedQuery,
    zone ? zone.radius : radius,
    zone ? true : useRadius,
    "",
    zone ? { latitude: zone.latitude, longitude: zone.longitude } : undefined,
    sportQuery,
    eventType
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (events || []).filter((e) => e.starts_at && new Date(e.starts_at) >= now);
  }, [events]);

  const shownClubs = showClubs ? clubs : [];
  const shownEvents = showEvents ? upcomingEvents : [];

  const toggleType = (type: "clubs" | "events") => {
    if (type === "clubs") {
      if (showClubs && !showEvents) { setShowEvents(true); setShowClubs(false); } else setShowClubs(!showClubs);
    } else if (showEvents && !showClubs) { setShowClubs(true); setShowEvents(false); } else setShowEvents(!showEvents);
  };

  const hasActiveFilters = radius !== 30 || !!sportQuery.trim() || useRadius || !!eventType;

  const Chip = ({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.8}>
      <Icon name={icon} size={16} color={active ? Colors.blanc : Colors.noir} />
      <Text style={[styles.chipText, active && { color: Colors.blanc }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.fond }}>
      <View style={styles.headerArea}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Rechercher un club, un événement..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={Colors.grisTexte}
            style={{ flex: 1, fontSize: 16, fontFamily: Fonts.regular, color: Colors.noir }}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Icon name="close-circle" size={20} color={Colors.gris} />
            </TouchableOpacity>
          ) : (
            <Icon name="search" size={20} color={Colors.grisTexte} />
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity style={styles.chip} onPress={() => setShowFilters(true)} activeOpacity={0.8}>
            <Icon name="options-outline" size={16} color={Colors.noir} />
            <Text style={styles.chipText}>Filtres</Text>
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
          <Chip label="Clubs" icon="people-outline" active={showClubs} onPress={() => toggleType("clubs")} />
          <Chip label="Événements" icon="calendar-outline" active={showEvents} onPress={() => toggleType("events")} />
          <Chip label={`Autour de moi (${radius} km)`} icon="locate-outline" active={useRadius} onPress={() => setUseRadius((v) => !v)} />
        </ScrollView>

      </View>

      {viewMode === "list" ? (
        <ResultsList
          clubs={shownClubs}
          events={shownEvents}
          refreshing={loading}
          onRefresh={refresh}
          onEndReached={fetchMoreEvents}
          loadingMore={loadingMore}
        />
      ) : (
        <SearchMapView clubs={shownClubs} events={shownEvents} loading={loading} onSearchZone={setZone} />
      )}

      <TouchableOpacity
        style={[styles.viewFab, { bottom: viewMode === "map" ? 144 : 24 }]}
        onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
        activeOpacity={0.85}
        accessibilityLabel={viewMode === "list" ? "Afficher la carte" : "Afficher la liste"}
      >
        <Icon name={viewMode === "list" ? "map" : "list"} size={24} color={Colors.blanc} />
      </TouchableOpacity>

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
  headerArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 12, backgroundColor: Colors.fond },
  searchBar: {
    flexDirection: "row",
    backgroundColor: Colors.blanc,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  chipRow: { gap: 8, paddingRight: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  chipActive: { backgroundColor: Colors.noir, borderColor: Colors.noir },
  chipText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.noir },
  filterDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.rouge },
  viewFab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.noir,
    elevation: 6,
    shadowColor: Colors.noir,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
