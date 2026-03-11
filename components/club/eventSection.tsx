import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Card from "../card";
import { useRouter } from "expo-router";

export default function EventSection() {
    const router = useRouter();
    return (<View style={styles.sectionContainer}>
        <FlatList
                data={Array.from({ length: 10 }).map((_, i) => ({
                    id: `event-${i}`,
                    name: `Événement ${i + 1}`,
                    bannerImageUrl: `https://picsum.photos/seed/event${i}/300/150`,
                    imageUrl: `https://picsum.photos/seed/event${i}/100/100`,
                    addressLine1: `Adresse ${i + 1}`,
                    city: `Ville ${i + 1}`,
                    distance: Math.random() * 10,
                    type: "le foot"
                }))}
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
    </View>)
}

const styles = StyleSheet.create({
    sectionContainer: {
        padding: 20,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 10,
    }
});