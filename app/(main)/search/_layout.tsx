import { slideScreenOptions } from "@/constants/navigation";
import { Stack } from "expo-router";
import React from "react";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function SearchLayout() {
  return <Stack screenOptions={slideScreenOptions} />;
}
