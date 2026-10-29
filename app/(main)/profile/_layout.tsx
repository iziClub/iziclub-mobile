import { slideScreenOptions } from "@/constants/navigation";
import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return <Stack screenOptions={slideScreenOptions} />;
}
