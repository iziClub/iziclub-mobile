import React from "react";
import { Redirect } from "expo-router";

export default function MapRedirect() {
  return <Redirect href={{ pathname: "/search", params: { view: "map" } }} />;
}
