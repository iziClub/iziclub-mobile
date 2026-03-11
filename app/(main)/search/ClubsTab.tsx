import React, { useState } from "react";
import { View, FlatList } from "react-native";
import Card from "@/components/card";
import { useRouter } from "expo-router";
import { SearchItem } from "@/components/search/types";
import { useEffect } from "react";

interface Props {
  data: SearchItem[]
}

export default function ClubsTab({ data }: Props) {
    const [localData, setLocalData] = useState(data);
  const router = useRouter();
    useEffect(() => {
        setLocalData(data);
    }, [data]);
  return (
    <View style={{flex:1,paddingHorizontal:12,paddingTop:10}}>
      <FlatList
        data={localData}
        keyExtractor={(item)=>item.id}
        numColumns={2}
        columnWrapperStyle={{justifyContent:"space-between"}}
        showsVerticalScrollIndicator={false}
        renderItem={({item})=>(
            <View style={{ width: "49%" }}>
          <Card
            title={item.name}
            banner={item.bannerImageUrl}
            avatar={item.imageUrl}
            address={`${item.addressLine1}, ${item.city}`}
            distance={item.distance?.toFixed(1)}
            tags={[item.type]}
            type="club"
            onPress={() => router.push(`/search/club/${item.id}`)}
          />
            </View>
        )}
      />
    </View>
  );
}