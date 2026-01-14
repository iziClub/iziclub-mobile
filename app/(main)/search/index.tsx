import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useState } from "react";
import ClubsTab from "./clubs";
import EventsTab from "./events";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import Searchbar from "@/components/searchBar";
const Tab = createMaterialTopTabNavigator();

export default function SearchTabs() {
  const [radius, setRadius] = useState(50);
  const [query, setQuery] = useState("");
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Searchbar value={query} onChangeText={setQuery} />
      <View style={styles.sliderBlock}>
        <Text style={styles.radiusLabel}>Rayon : {radius} km</Text>
        <Slider
          minimumValue={10}
          maximumValue={500}
          step={5}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#ccc"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: "black", height: 3 },
            tabBarLabelStyle: {
              fontSize: 16,
              fontWeight: "600",
              textTransform: "none",
            },
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "#777",
            tabBarStyle: {
              backgroundColor: "white",
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        >
          <Tab.Screen name="Clubs" component={ClubsTab} />
          <Tab.Screen name="Événements" component={EventsTab} />
        </Tab.Navigator>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 20,
    padding: 3,
    justifyContent: "center",
  },
  toggleInactive: {
    backgroundColor: "#ccc",
    justifyContent: "flex-start",
  },
  toggleActive: {
    backgroundColor: "#000",
    justifyContent: "flex-end",
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "white",
  },
  toggleDotActive: {},
  sliderBlock: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
});