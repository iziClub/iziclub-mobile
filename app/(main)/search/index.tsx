import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from 'expo-router';
// Tes imports
import ClubsTab from "./ClubsTab";
import EventsTab from "./EventsTabs";
import FilterBottomSheet from "../../../components/search/FilterModal";
import { useSearch } from "../../../components/search/useSearch";
import { useLocalSearchParams } from 'expo-router';

const Tab = createMaterialTopTabNavigator();

export default function SearchScreen() {
  const { q, tab } = useLocalSearchParams<{ q?: string, tab?: string }>();
  const [query, setQuery] = useState(q || "");
  const [debouncedQuery, setDebouncedQuery] = useState(q || "");
  const [radius, setRadius] = useState(30);
  const [selectedSort, setSelectedSort] = useState("Plus pertinent");
  const [useRadius, setUseRadius] = useState(false);
  const [sportQuery, setSportQuery] = useState("");
  // Debounce pour éviter de spammer l'API à chaque lettre tapée
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
    sportQuery
  );
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Un filtre est considéré comme "actif" si le rayon n'est plus à sa valeur par défaut
  const hasActiveFilters = radius !== 30 || !!sportQuery.trim() || useRadius;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      
      {/* HEADER DE RECHERCHE */}
      <View style={styles.headerArea}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Rechercher"
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#999"
            style={{ flex: 1, fontSize: 16 }}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")}>
               <Ionicons name="close-circle" size={20} color="#CCC" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={20} color="#999" />
          )}
        </View>
      </View>

      {/* TABS NAVIGATION */}
      <Tab.Navigator
        initialRouteName={tab === "Événements" ? "Événements" : "Clubs"}
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: "black", height: 2 },
          tabBarLabelStyle: { fontWeight: "bold", textTransform: "none", fontSize: 15 },
        }}
      >
        <Tab.Screen 
          name="Clubs" 
          options={{ tabBarLabel: `Clubs (${clubs?.length || 0})` }}
        >
          {() => <ClubsTab data={clubs} refreshing={loading} onRefresh={refresh} />}
        </Tab.Screen>

        <Tab.Screen 
          name="Événements" 
          options={{ tabBarLabel: `Événements (${events?.length || 0})` }}
        >
          {() => <EventsTab data={events} refreshing={loading} onRefresh={refresh} onEndReached={fetchMoreEvents} loadingMore={loadingMore} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* BOUTONS FLOTTANTS (FABs) */}
      <View style={styles.fabContainer}>
        {/* BOUTON FILTRES */}
        <TouchableOpacity 
          style={styles.fabWhite} 
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <Ionicons name="options-outline" size={20} color="black" />
          <Text style={styles.fabTextBlack}>Filtres</Text>
          {hasActiveFilters && <View style={styles.badge} />}
        </TouchableOpacity>

        {/* BOUTON CARTE */}
        <TouchableOpacity 
          style={styles.fabBlue}
          onPress={() => router.push('/(main)/search/map')}
        >
          <Text style={styles.fabTextWhite}>Carte</Text>
          <Ionicons name="map-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* OVERLAY FILTRES (GORHOM) */}
      <FilterBottomSheet 
        sheetRef={bottomSheetRef}
        radius={radius}
        setRadius={setRadius}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        useRadius={useRadius}
        setUseRadius={setUseRadius}
        sportQuery={sportQuery}
        setSportQuery={setSportQuery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerArea: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 15 
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 15,
    alignItems: 'center'
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30, // Un peu plus haut que le bord
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 12,
    zIndex: 0, // Pour être sûr qu'il passe au dessus des listes
  },
  fabWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    // Ombre pour Android
    elevation: 8,
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  fabBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A78FF',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#4A78FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fabTextBlack: { 
    marginLeft: 8, 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  fabTextWhite: { 
    marginRight: 8, 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: 'white' 
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF4B4B',
    borderWidth: 2,
    borderColor: 'white'
  }
});