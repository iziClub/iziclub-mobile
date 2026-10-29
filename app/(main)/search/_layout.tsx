import { slideScreenOptions } from "@/constants/navigation";
import { Stack } from "expo-router";
import React from "react";

export default function SearchLayout() {
  return <Stack screenOptions={slideScreenOptions} />;
}
