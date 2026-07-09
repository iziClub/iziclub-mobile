import React, { useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import Card from "@/components/card";
import { useRouter } from "expo-router";
import { ClubSearchItem } from "@/components/search/types";
import { useEffect } from "react";

interface Props {
  data: ClubSearchItem[],
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ClubsTab({ data, refreshing, onRefresh }: Props) {
    const [localData, setLocalData] = useState(data);
  const router = useRouter();
    useEffect(() => {
        setLocalData(data);
    }, [data]);
    // console.info("Données reçues dans ClubsTab:", data);
  return (
    <View style={{flex:1,paddingHorizontal:12,paddingTop:10}}>
      <FlatList
        data={localData}
        keyExtractor={(item)=>item.id}
        refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={['#4A78FF']} // Couleur sur Android
          tintColor={'#4A78FF'} // Couleur sur iOS
        />
      }
        numColumns={2}
        columnWrapperStyle={{justifyContent:"space-between"}}
        showsVerticalScrollIndicator={false}

        renderItem={({item})=>(
            <View style={{ width: "49%" }}>
          <Card
            title={item.name}
            banner={item.banner!}
            avatar={item.image!}
            address={`${item.street}, ${item.city}`}
            distanceInKm={item.distanceInKm}
            tags={[item.sport ?? "Sport non précisé"]}
            type="club"
            onPress={() => router.push(`/search/club/${item.id}`)}
          />
            </View>
        )}
      />
    </View>
  );
}