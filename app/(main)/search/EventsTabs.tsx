import React, { use, useEffect, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import Card from "@/components/card";
import { EventSearchItem } from "../../../components/search/types";
import { useRouter } from "expo-router";

interface Props {
  data: EventSearchItem[],
  refreshing: boolean;
  onRefresh: () => void;
}

export default function EventsTab({ data, refreshing, onRefresh }: Props) {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);
  const router = useRouter();

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
      <FlatList
        data={localData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={['#4A78FF']} // Couleur sur Android
          tintColor={'#4A78FF'} // Couleur sur iOS
        />
      }
        renderItem={({ item }) => (
            <View style={{ width: "49%" }}>
          <Card
            title={item.name}
            banner={item.image!}
            avatar={item.image!}
            address={`${item.street}, ${item.city}`}
            distance={item.distance?.toFixed(1)}
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