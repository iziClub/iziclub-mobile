import React from "react";
import { View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import Card from "@/components/card";
import { EventSearchItem } from "../../../components/search/types";
import { useRouter } from "expo-router";

interface Props {
  data: EventSearchItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void; // <-- Ajouté
  loadingMore: boolean;     // <-- Ajouté
}

export default function EventsTab({ data, refreshing, onRefresh, onEndReached, loadingMore }: Props) {
  const router = useRouter();

  // Affiche un loader en bas de page uniquement si on charge la suite
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#4A78FF" />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
      <FlatList
        data={data} // Utilisation directe de la prop injectée
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        
        // Gestion du Refresh (Haut de page)
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#4A78FF']} 
            tintColor={'#4A78FF'} 
          />
        }

        // Gestion du Infinite Scroll (Bas de page)
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3} // Se déclenche un peu avant le bas pour une UX fluide
        ListFooterComponent={renderFooter}

        renderItem={({ item }) => (
          <View style={{ width: "49%" }}>
            <Card
              title={item.name}
              banner={item.image!}
              address={`${item.street}, ${item.city}`}
              distanceInKm={item.distanceInKm}
              tags={[item.sport || "Sport non précisé", item.type]}
              type="event"
              onPress={() =>
                router.push({
                  pathname: "/search/event/[id]",
                  params: { id: item.id }
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
}