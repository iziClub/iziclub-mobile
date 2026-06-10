import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // useEffect(() => {
  //   if (isLoading) return;

  //   // On vérifie si l'utilisateur est dans le groupe d'authentification
  //   const inAuthGroup = segments[0] === "(auth)";

  //   if (!user && !inAuthGroup) {
  //     // Pas de user + pas dans (auth) -> Go Login
  //     // Utilise replace pour éviter que l'utilisateur puisse revenir en arrière
  //     router.replace("/(auth)/login"); 
  //   } else if (user && inAuthGroup) {
  //     // User connecté + dans (auth) -> Go Home
  //     router.replace("/(main)/home"); 
  //   }
  // }, [user, isLoading, segments]);

  // Pendant le chargement du token, on affiche un loader pour éviter le flash d'écran
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E011A" />
      </View>
    );
  }

  // C'est ICI qu'on définit le Stack unique
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}