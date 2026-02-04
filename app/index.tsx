import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  // plus tard tu mettras ta logique d'auth ici
  return <Redirect href="/home" />;
  // ou "/home" si déjà connecté
}
