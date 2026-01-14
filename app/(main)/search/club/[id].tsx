import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import Card from "@/components/card";
import TeamCard from "@/components/teamCard";
import ClubCalendar from "@/components/calendar";

const MOCK_CLUBS = Array.from({ length: 80 }).map((_, i) => ({
    id: (i + 1).toString(),
    name: `Club ${i + 1}`,
    title: [
        "Le cœur du foot mosellan",
        "Zen Yoga Paris",
        "Fitness & Wellness Lyon",
        "Tennis Passion Marseille",
        "Crossfit Challenge Bordeaux",
    ][i % 5],
    description: [
        "Venez pratiquer le football dans une ambiance conviviale et dynamique.",
        "Retrouvez sérénité et équilibre avec nos cours de yoga.",
        "Des installations modernes pour atteindre vos objectifs fitness.",
        "Cours de tennis pour tous les niveaux, compétition et loisir.",
        "Repoussez vos limites avec nos sessions intenses de Crossfit.",
    ][i % 5],
    type: ["Fitness", "Football", "Tennis", "Yoga", "Crossfit"][i % 5],
    city: ["Paris", "Lyon", "Marseille", "Lille", "Bordeaux"][i % 5],
    addressLine1: `${10 + i} rue du Sport`,
    imageUrl: `https://picsum.photos/seed/avatar${i}/300/300`,
    bannerImageUrl: `https://picsum.photos/seed/banner${i}/600/400`,
    distance: (Math.random() * 15 + 0.5).toFixed(1),
}));

const SECTIONS = ["Informations", "Événements", "Galerie", "Calendrier"];

export default function ClubDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);

    const club = MOCK_CLUBS.find((c) => c.id === id);

    if (!club) {
        return (
            <View style={styles.center}>
                <Text>Club non trouvé</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubCity}>{club.city}</Text>
                </View>

                <Image source={{ uri: club.imageUrl }} style={styles.clubImage} />

                <TouchableOpacity style={styles.saveButton}>
                    <MaterialIcons name="bookmark-border" size={28} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Sections horizontal scroll */}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 10 }}
            >
                {SECTIONS.map((section) => (
                    <TouchableOpacity
                        key={section}
                        style={[
                            styles.sectionButton,
                            activeSection === section && styles.sectionButtonActive,
                        ]}
                        onPress={() => setActiveSection(section)}
                    >
                        <Text
                            style={[
                                styles.sectionText,
                                activeSection === section && styles.sectionTextActive,
                            ]}
                        >
                            {section}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>


            {/* Contenu de la section */}
            <View style={styles.sectionContent}>
                {activeSection === "Informations" && (
                    <ScrollView contentContainerStyle={{ paddingBottom: 40, padding: 16 }}>
                        {/* Bannière du club */}
                        <Image
                            source={{ uri: club.bannerImageUrl }}
                            style={{
                                width: "100%",
                                height: 180,
                                borderRadius: 12,
                                marginBottom: 16,
                            }}
                            resizeMode="cover"
                        />

                        {/* Titre + description */}
                        <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
                                {club.title}
                            </Text>
                            <Text style={{ fontSize: 14, color: "#555" }}>
                                {club.description}
                            </Text>
                        </View>

                        {/* Événements */}
                        <View>
                            <Text style={{ fontSize: 28, fontWeight: "600", marginBottom: 12, paddingHorizontal: 16 }}>
                                Nos événements
                            </Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, padding: 16, gap: 12, width: '100%', shadowOpacity: 0.5 }}
                            >
                                {Array.from({ length: 5 }).map((event, i) => (
                                    <Card
                                        key={i}
                                        title={`Événement ${i + 1}`}
                                        banner={`https://picsum.photos/seed/event${i}/300/150`}
                                        type="event"
                                        onPress={() => console.log(`Clicked event ${i + 1}`)}
                                    />
                                ))}
                            </ScrollView>
                            <Text style={{ fontSize: 28, fontWeight: "600", marginBottom: 12, paddingHorizontal: 16 }}>
                                Nos équipes
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    paddingHorizontal: 16
                                }}
                            >
                                <View style={{ width: "49%" }}>
                                    <TeamCard title="Senior M1" color="#D42E2F" subtitle="Régional 3" />
                                </View>

                                <View style={{ width: "49%" }}>
                                    <TeamCard title="Senior M2" color="#D85D12" subtitle="Sénior 2" />
                                </View>

                                <View style={{ width: "49%" }}>
                                    <TeamCard title="U15 M1" color="#F9BC12" subtitle="Moselle U15 - D1" />
                                </View>
                            </View>
                            <Text style={{ fontSize: 28, fontWeight: "600", marginBottom: 12, paddingHorizontal: 16 }}>
                                Nos Photos
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16 }}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Image
                                        key={i}
                                        source={{ uri: `https://picsum.photos/seed/photo${i}/300/300` }}
                                        style={{
                                            width: "49%",
                                            height: 150,
                                            borderRadius: 12,
                                            marginBottom: 12,
                                        }}
                                    />
                                ))}
                            </View>
                            <ClubCalendar />
                        </View>
                    </ScrollView>
                )}

                {activeSection === "Événements" && (
                    <View>
                        <Text style={styles.sectionTitle}>Événements à venir</Text>
                        <Text>Événement 1</Text>
                        <Text>Événement 2</Text>
                        <Text>Événement 3</Text>
                    </View>
                )}

                {activeSection === "Galerie" && (
                    <View>
                        <Text style={styles.sectionTitle}>Galerie photos</Text>
                        <Text>[Images du club]</Text>
                    </View>
                )}

                {activeSection === "Calendrier" && (
                    <View>
                        <Text style={styles.sectionTitle}>Calendrier des activités</Text>
                        <Text>[Calendrier ici]</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
        backgroundColor: "#fff",
    },

    backButton: { 
        padding: 6,
        marginRight: 12
    },
    backArrow: { 
        fontSize: 22 
    },

    clubInfo: { 
        marginRight: 8, 
        alignItems: "flex-end" 
    },
    clubName: { 
        fontSize: 18, 
        fontWeight: "bold" 
    },
    clubCity: { 
        fontSize: 12, 
        color: "#555", 
        marginTop: 2 
    },

    clubImage: { 
        width: 50, 
        height: 50, 
        borderRadius: 25, 
        marginRight: 8 
    },
    saveButton: { 
        padding: 6 
    },
    sectionsContainer: {
        backgroundColor: "#fff",
        height: 40,
    },
    sectionsContentContainer: {
        paddingHorizontal: 16,
        alignItems: "center",
    },
    sectionButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        height: 28,
    },
    sectionButtonActive: {
        backgroundColor: "#000",
    },
    sectionText: {
        fontSize: 14,
        color: "#555",
        fontWeight: "500",
    },
    sectionTextActive: {
        color: "#fff",
    },
    sectionContent: {
        paddingTop: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    center: { 
        justifyContent: "center", 
        alignItems: "center",
    }
});
