import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Card from "../card";
import { useRouter } from "expo-router";
import { Event } from "@/types/event";
import EmptyEvents from "./emptyEvent";
import { EventSearchItem } from "../search/types";
import { Fonts } from "@/constants/theme";

export default function EventSection({events}: {events: any[]}) {
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
                    banner={item.coverImagePath ?? "https://via.placeholder.com/300x150"}
                    address={`${item.address?.street || item.street || ''}, ${item.address?.city || item.city || ''}`}
                    distanceInKm={item.distanceInKm}
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
        fontFamily: Fonts.titre,
        marginBottom: 12,
    }
});