import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FilterBottomSheet from "../../../components/search/FilterModal";
import { useSearch } from "../../../components/search/useSearch";
import ResultsList from "../../../components/search/ResultsList";
import SearchMapView from "../../../components/search/SearchMapView";
import { Colors } from "@/constants/colors";
import { Fonts, Radius, Shadow } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Tag from "@/components/ui/Tag";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    if (viewMode === "list") { setZone(null); setDrawerOpen(false); }
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.fond }}>
      <View style={styles.headerArea}>
        <Input
          accessibilityLabel="Rechercher"
          placeholder="Rechercher un club, un événement..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          leading={<Icon name="search" size={20} color={Colors.grisTexte} />}
          trailing={
            query.length > 0 ? (
              <IconButton
                name="close-circle"
                variant="fantome"
                color={Colors.gris}
                accessibilityLabel="Effacer la recherche"
                onPress={() => setQuery("")}
                style={styles.clearButton}
              />
            ) : null
          }
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <View>
            <Tag label="Filtres" icon="options-outline" onPress={() => setShowFilters(true)} />
            {hasActiveFilters && <View style={styles.filterDot} pointerEvents="none" />}
          </View>
          <Tag label="Clubs" icon="people-outline" selected={showClubs} onPress={() => toggleType("clubs")} />
          <Tag label="Événements" icon="calendar-outline" selected={showEvents} onPress={() => toggleType("events")} />
          <Tag label={`Autour de moi (${radius} km)`} icon="locate-outline" selected={useRadius} onPress={() => setUseRadius((v) => !v)} />
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
        <SearchMapView clubs={shownClubs} events={shownEvents} loading={loading} onSearchZone={setZone} onSelectionChange={setDrawerOpen} />
      )}

      {!drawerOpen && (
        <View style={[styles.viewSwitch, { bottom: 24 }]}>
          {(["list", "map"] as const).map((mode, i) => {
            const selected = viewMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                disabled={selected}
                onPress={() => setViewMode(mode)}
                activeOpacity={0.8}
                style={[styles.switchBtn, i === 0 ? styles.switchLeft : styles.switchRight, selected && styles.switchBtnSelected]}
              >
                <Icon name={mode === "list" ? "list" : "map"} size={18} color={selected ? Colors.grisTexte : Colors.noir} />
                <Text style={[styles.switchText, selected && { color: Colors.grisTexte }]}>{mode === "list" ? "Liste" : "Carte"}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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
  clearButton: { width: 32, height: 32 },
  chipRow: { gap: 8, paddingRight: 20, alignItems: "center" },
  filterDot: { position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: Radius.full, backgroundColor: Colors.rouge, borderWidth: 2, borderColor: Colors.fond },
  viewSwitch: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    ...Shadow.flottante,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  switchLeft: { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 },
  switchRight: { borderTopRightRadius: 999, borderBottomRightRadius: 999, borderLeftWidth: 0 },
  switchBtnSelected: { backgroundColor: Colors.grisClair },
  switchText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.noir },
});
