import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Card from "@/components/card";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import { ClubSearchItem, EventSearchItem } from "./types";

type Result =
  | { kind: "club"; item: ClubSearchItem }
  | { kind: "event"; item: EventSearchItem };

interface Props {
  clubs: ClubSearchItem[];
  events: EventSearchItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  loadingMore: boolean;
}

export default function ResultsList({ clubs, events, refreshing, onRefresh, onEndReached, loadingMore }: Props) {
  const router = useRouter();

  const data: Result[] = [
    ...clubs.map((item) => ({ kind: "club" as const, item })),
    ...events.map((item) => ({ kind: "event" as const, item })),
  ].sort((a, b) => (a.item.distanceInKm ?? Infinity) - (b.item.distanceInKm ?? Infinity));

  if (data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}>
        {refreshing ? (
          <ActivityIndicator size="large" color={Colors.noir} />
        ) : (
          <>
            <Text style={{ fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir, textAlign: "center" }}>Aucun résultat</Text>
            <Text style={{ marginTop: 8, color: Colors.grisTexte, textAlign: "center" }}>
              Essaye une autre recherche ou modifie les filtres.
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12 }}>
      <FlatList
        data={data}
        keyExtractor={(r) => `${r.kind}-${r.item.id}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.noir]} tintColor={Colors.noir} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ paddingVertical: 20 }} color={Colors.noir} /> : undefined}
        renderItem={({ item: r }) => (
          <View style={{ width: "49%" }}>
            {r.kind === "club" ? (
              <Card
                title={r.item.name}
                banner={r.item.banner!}
                avatar={r.item.image!}
                address={`${r.item.street}, ${r.item.city}`}
                distanceInKm={r.item.distanceInKm}
                tags={[r.item.sport ?? "Sport non précisé"]}
                type="club"
                onPress={() => router.push(`/search/club/${r.item.id}`)}
              />
            ) : (
              <Card
                title={r.item.name}
                banner={r.item.coverImagePath!}
                address={`${r.item.street}, ${r.item.city}`}
                distanceInKm={r.item.distanceInKm}
                tags={[r.item.sport || "Sport non précisé", r.item.type]}
                type="event"
                onPress={() => router.push({ pathname: "/search/event/[id]", params: { id: r.item.id } })}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}
