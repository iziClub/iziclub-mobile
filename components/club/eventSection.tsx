import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Card from "../card";
import { useRouter } from "expo-router";
import { Event } from "@/types/event";
import EmptyEvents from "./emptyEvent";
import { EventSearchItem } from "../search/types";

export default function EventSection({events}: {events: EventSearchItem[]}) {
    const router = useRouter();
    console.info("Events reçus dans EventSection:", events);
    return (<View style={styles.sectionContainer}>
        <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<EmptyEvents />}
                renderItem={({ item }) => (
                    <View style={{ width: "49%" }}>
                  <Card
                    title={item.name}
                    banner={item.banner_url ?? "https://via.placeholder.com/300x150"}
                    // avatar={item.image ?? "https://via.placeholder.com/300x150"}
                    address={`${item.street}, ${item.city}`}
                    distance_km={item.distance_km}
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