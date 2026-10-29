import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        // Glissement horizontal au changement d'onglet
        animation: "shift",
        headerStyle: {
          height: 44,
          backgroundColor: Colors.fond,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.blanc,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1.5,
          borderTopColor: Colors.grisClair,
        },
        tabBarLabelStyle: { fontFamily: Fonts.medium, fontSize: 12, marginTop: 2 },
        tabBarActiveTintColor: Colors.noir,
        tabBarInactiveTintColor: Colors.grisTexte,
        sceneStyle: {
          backgroundColor: Colors.fond,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "",
          tabBarLabel: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("search", { screen: "index" });
          },
        })}
        options={{
          title: "",
          tabBarLabel: "Explorer",
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("profile", { screen: "index" });
          },
        })}
        options={{
          title: "",
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
