import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import Card from "../card";
import TeamCard from "../teamCard";

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
}

interface Props {
    club: Club;
    onSeeMore: (section: string) => void;
}

export default function InformationSection({ club, onSeeMore }: Props) {
    return (
        <ScrollView
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 60,
            }}
        >
            <Image source={{ uri: club.bannerImageUrl }} style={styles.banner} />

            <View style={styles.infoBlock}>
                <Text style={styles.title}>{club.title}</Text>
                <Text style={styles.description}>{club.description}</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.bigTitle}>Nos événements</Text>
                <TouchableOpacity onPress={() => onSeeMore("Événements")}>
                    <Text style={styles.seeMore}>Voir plus</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsContainer}
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={{ width: 260, marginRight: 12 }}>
                        <View style={{ width: "100%" }}>
                            <Card
                                title={`Événement ${i + 1}`}
                                banner={`https://picsum.photos/seed/event${i}/300/150`}
                                type="event"
                                onPress={() => console.log(`Clicked event ${i + 1}`)}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

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
                {Array.from({ length: 6 }).map((_, i) => (
                    <Image
                        key={i}
                        source={{ uri: `https://picsum.photos/seed/photo${i}/300/300` }}
                        style={styles.photo}
                    />
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