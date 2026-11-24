import { slideScreenOptions } from "@/constants/navigation";
import { Stack } from "expo-router";
import React from "react";

// Les écrans de connexion et d'inscription forment une seule pile :
// une fois connecté, on la referme d'un coup pour revenir à l'écran d'origine.
export default function AuthLayout() {
  return <Stack screenOptions={slideScreenOptions} />;
}
