import React, { useState } from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import Card from "@/components/card";
import { useRouter } from "expo-router";
import { ClubSearchItem } from "@/components/search/types";
import { useEffect } from "react";

interface Props {
  data: ClubSearchItem[];
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ClubsTab({ data, refreshing, onRefresh }: Props) {
  const [localData, setLocalData] = useState(data);
  const router = useRouter();
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const isLoading = refreshing && (!localData || localData.length === 0);
  const isEmpty = !isLoading && (!localData || localData.length === 0);

  const renderSkeleton = () => (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={{ width: '49%', marginBottom: 16 }}>
            <View style={{ height: 160, borderRadius: 18, backgroundColor: '#E5E7EB' }} />
            <View style={{ height: 14, width: '60%', borderRadius: 8, backgroundColor: '#E5E7EB', marginTop: 12 }} />
            <View style={{ height: 12, width: '40%', borderRadius: 8, backgroundColor: '#E5E7EB', marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, backgroundColor: 'white' }}>
      <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#F3F4F6', marginBottom: 16 }} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', textAlign: 'center' }}>Aucun club trouvé</Text>
      <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>Essaye une autre recherche ou élargis ton rayon pour voir plus de clubs.</Text>
    </View>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  if (isEmpty) {
    return renderEmptyState();
  }

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