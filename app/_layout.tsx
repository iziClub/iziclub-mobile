import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { slideScreenOptions } from "@/constants/navigation";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/colors";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { BricolageGrotesque_700Bold } from "@expo-google-fonts/bricolage-grotesque";
import { Geist_400Regular, Geist_500Medium } from "@expo-google-fonts/geist";

SplashScreen.preventAutoHideAsync();

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fond }}>
        <ActivityIndicator size="large" color={Colors.noir} />
      </View>
    );
  }

  // C'est ICI qu'on définit le Stack unique
  return <Stack screenOptions={slideScreenOptions} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    Geist_400Regular,
    Geist_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <LocationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </LocationProvider>
    </AuthProvider>
  );
}