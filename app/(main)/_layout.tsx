import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerStyle: {
          height: 44,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 60,
          paddingBottom: 4,
          paddingTop: 4,
          borderTopWidth: 0.5,
          borderTopColor: "#e2e2e2",
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "#848484ff",
        sceneStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile/likedEvents" options={{ href: null }} />
<Tabs.Screen name="profile/savedClubs" options={{ href: null }} />
<Tabs.Screen name="profile/upcomingEvents" options={{ href: null }} />
<Tabs.Screen name="profile/pastEvents" options={{ href: null }} />
<Tabs.Screen name="profile/inscriptions" options={{ href: null }} />
<Tabs.Screen name="profile/inscription-detail" options={{ href: null }} />
    </Tabs>
  );
}
