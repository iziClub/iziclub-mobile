import React, { use, useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import Card from "@/components/card";
import { SearchItem } from "../../../components/search/types";
import { useRouter } from "expo-router";

interface Props {
  data: SearchItem[]
}

export default function EventsTab({ data }: Props) {
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
        renderItem={({ item }) => (
            <View style={{ width: "49%" }}>
          <Card
            title={item.name}
            banner={item.bannerImageUrl}
            avatar={item.imageUrl}
            address={`${item.addressLine1}, ${item.city}`}
            distance={item.distance?.toFixed(1)}
            tags={[item.type]}
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