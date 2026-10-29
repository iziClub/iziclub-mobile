import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/colors";
import Icon from "@/components/ui/Icon";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerStyle: {
          height: 44,
          backgroundColor: Colors.fond,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.blanc,
          height: 60,
          paddingBottom: 4,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: Colors.grisClair,
        },
        tabBarActiveTintColor: Colors.noir,
        tabBarInactiveTintColor: Colors.gris,
        sceneStyle: {
          backgroundColor: Colors.fond,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "",
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="search-outline" size={size} color={color} />
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
