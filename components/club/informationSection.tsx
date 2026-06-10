import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import Card from "../card";
import TeamCard from "../teamCard";
import { Event } from "@/types/event";

interface Club {
    id: string;
    name: string;
    title: string;
    description: string;
    type: string;
    city: string;
    addressLine1: string;
    imageUrl: string;
    bannerImageUrl: string;
    events: Event[];
}

interface Props {
    club: Club;
    onSeeMore: (section: string) => void;
}

export default function InformationSection({ club, onSeeMore }: Props) {
    // console.log("club in InformationSection: ", club);
    return (
        <ScrollView
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 60,
            }}
        >
            <Image source={{ uri: club.bannerImageUrl }} style={styles.banner} />

            <View style={styles.infoBlock}>
                <Text style={styles.title}>{club.name}</Text>
                <Text style={styles.description}>{club.description}</Text>
            </View>
            {club.events && club.events.length > 0 && (
                <>
            <View style={styles.sectionHeader}>
                <Text style={styles.bigTitle}>Nos événements</Text>
                <TouchableOpacity onPress={() => onSeeMore("Événements")}>
                    <Text style={styles.seeMore}>Voir plus</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 12, paddingRight: 16, marginBottom: 24 }}
>
    {club.events.map((event) => (
        <Card
            key={event.id}
            title={event.name}
            banner={event.banner_url ?? "https://via.placeholder.com/300x150"}
            address={`${event.address.street}, ${event.address.city}`}
            distance_km={event.distance_km}
            tags={[event.sport || "Sport non précisé", event.type]}
            type="event"
            onPress={() => onSeeMore("Événements")}
            width={220}
        />
    ))}
</ScrollView>
            </>
            )}

            <Text style={styles.bigTitle}>Nos équipes</Text>

            <View style={styles.teamContainer}>
                <View style={styles.teamItem}>
                    <TeamCard title="Senior M1" color="#D42E2F" subtitle="Régional 3" />
                </View>

                <View style={styles.teamItem}>
                    <TeamCard title="Senior M2" color="#D85D12" subtitle="Sénior 2" />
                </View>

                <View style={styles.teamItem}>
                    <TeamCard title="U15 M1" color="#F9BC12" subtitle="Moselle U15 - D1" />
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.bigTitle}>Nos photos</Text>
                <TouchableOpacity onPress={() => onSeeMore("Galerie")}>
                    <Text style={styles.seeMore}>Voir plus</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.gallery}>
                {club.gallery.map((picture) =>(
                    <Image
                        key={picture.id}
                        source={{ uri: picture.url}}
                        style={styles.photo}/>
                ))}

            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    banner: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginBottom: 16,
    },

    infoBlock: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    seeMore: {
        fontSize: 14,
        color: "#007AFF", // bleu "clicable"
        fontWeight: "600",
    },
    description: {
        fontSize: 14,
        color: "#555",
    },
    bigTitle: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 12,
    },
    eventsContainer: {
        paddingRight: 16,
        marginBottom: 24,
    },

    teamContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    teamItem: {
        width: "49%",
        marginBottom: 12,
    },
    gallery: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    photo: {
        width: "49%",
        height: 150,
        borderRadius: 12,
        marginBottom: 12,
    },


});