import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ClubsTab from "./ClubsTab";
import EventsTab from "./EventsTabs";
import { useSearch } from "../../../components/search/useSearch";

const Tab = createMaterialTopTabNavigator();

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState(city);

  const [radius, setRadius] = useState(50);
  const [useRadius, setUseRadius] = useState(true);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Debounce city
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCity(city), 300);
    return () => clearTimeout(handler);
  }, [city]);

  const { clubs, events } = useSearch(debouncedQuery, radius, useRadius, debouncedCity);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      
      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Rechercher un club ou événement..."
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
      </View>

      {/* CITY FILTER */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Ville (optionnel)..."
          value={city}
          onChangeText={setCity}
          style={styles.search}
        />
      </View>

      {/* RADIUS */}
<View style={styles.sliderBlock}>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
    <Text style={{ fontWeight: "500" }}>Activer rayon</Text>
    <Switch value={useRadius} onValueChange={setUseRadius} />
  </View>

  {useRadius && (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.radiusLabel}>Rayon : {radius} km</Text>
      <Slider
        minimumValue={1}
        maximumValue={200}
        step={1}
        value={radius}
        onValueChange={setRadius}
      />
    </View>
  )}
</View>

      {/* TABS */}
      <View style={{ flex: 1 }}>
        <Tab.Navigator
  screenOptions={{
    tabBarIndicatorStyle: { backgroundColor: "black" },
    tabBarLabelStyle: { fontWeight: "600", textTransform: "none" },
  }}
>
  <Tab.Screen
  name="Clubs"
  options={{
    tabBarLabel: `Clubs (${clubs.length})`
  }}
>
  {() => <ClubsTab data={clubs} />}
</Tab.Screen>
  <Tab.Screen
    name="Événements"
    options={{
      tabBarLabel: `Événements (${events.length})`
    }}
    children={() => <EventsTab data={events} />}
  />
</Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10
  },
  search: {
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    fontSize: 16
  },
  sliderBlock: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4
  }
});
