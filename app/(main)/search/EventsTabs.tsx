import React from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
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
  const isLoading = refreshing && (!data || data.length === 0);
  const isEmpty = !isLoading && (!data || data.length === 0);

  const renderSkeleton = () => (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={{ width: '49%', marginBottom: 16 }}>
            <View style={{ height: 120, borderRadius: 18, backgroundColor: '#E5E7EB' }} />
            <View style={{ height: 14, width: '70%', borderRadius: 8, backgroundColor: '#E5E7EB', marginTop: 12 }} />
            <View style={{ height: 12, width: '50%', borderRadius: 8, backgroundColor: '#E5E7EB', marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, backgroundColor: 'white' }}>
      <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#F3F4F6', marginBottom: 16 }} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', textAlign: 'center' }}>Aucun événement trouvé</Text>
      <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>Essaye une autre recherche ou élargis ton rayon pour voir plus d'événements.</Text>
    </View>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  if (isEmpty) {
    return renderEmptyState();
  }

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
              banner={item.coverImagePath!}
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