import { Tabs } from "expo-router";
import React from "react";
import { StackActions } from "@react-navigation/native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

export default function MainLayout() {
  return (
    <Tabs
      backBehavior="history"
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
          height: 92,
          paddingBottom: 20,
          paddingTop: 10,
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
            const profileState = navigation.getState().routes.find(
              (route: { name: string; state?: { key?: string } }) => route.name === "profile"
            )?.state;
            if (profileState?.key) {
              navigation.dispatch({ ...StackActions.popTo("index"), target: profileState.key });
              navigation.navigate("profile");
            } else {
              navigation.navigate("profile", { screen: "index" });
            }
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
