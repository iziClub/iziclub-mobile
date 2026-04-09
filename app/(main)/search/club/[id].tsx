import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import Card from "@/components/card";
import TeamCard from "@/components/teamCard";
import ClubCalendar from "@/components/calendar";
import EventSection from "@/components/club/eventSection";
import GalerieSection from "@/components/club/galerieSection";
import ContactSection from "@/components/club/contactSection";
import InformationSection from "@/components/club/informationSection";
import { Header } from "@react-navigation/elements";
import HeaderClubDetails from "@/components/club/headerClubDetails";
import SelectSection from "@/components/club/selectSection";
import { getClubById } from "@/services/clubs.service";
import { mapApiClubToDetail } from "@/mappers/club.mapper";

// const MOCK_CLUBS = Array.from({ length: 80 }).map((_, i) => ({
//     id: (i + 1).toString(),
//     name: `Club ${i + 1}`,
//     title: [
//         "Le cœur du foot mosellan",
//         "Zen Yoga Paris",
//         "Fitness & Wellness Lyon",
//         "Tennis Passion Marseille",
//         "Crossfit Challenge Bordeaux",
//     ][i % 5],
//     description: [
//         "Venez pratiquer le football dans une ambiance conviviale et dynamique.",
//         "Retrouvez sérénité et équilibre avec nos cours de yoga.",
//         "Des installations modernes pour atteindre vos objectifs fitness.",
//         "Cours de tennis pour tous les niveaux, compétition et loisir.",
//         "Repoussez vos limites avec nos sessions intenses de Crossfit.",
//     ][i % 5],
//     type: ["Fitness", "Football", "Tennis", "Yoga", "Crossfit"][i % 5],
//     city: ["Paris", "Lyon", "Marseille", "Lille", "Bordeaux"][i % 5],
//     addressLine1: `${10 + i} rue du Sport`,
//     imageUrl: `https://picsum.photos/seed/avatar${i}/300/300`,
//     bannerImageUrl: `https://picsum.photos/seed/banner${i}/600/400`,
// }));

const SECTIONS = ["Informations", "Événements", "Galerie", "Calendrier", "Contact"];

export default function ClubDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);
    const [isLoading, setIsLoading] = useState(true);
    // const club = MOCK_CLUBS.find((c) => c.id === id);
    const [club, setClub] = useState<any>(null);
    useEffect(() => {
        const fetchClubData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data = await getClubById(id);
                const mappedData = mapApiClubToDetail(data);
                setClub(mappedData);
            } catch (error) {
                console.error("Erreur lors de la récupération du club:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClubData();
    }, [id]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4A78FF" />
            </View>
        );
    }

    if (!club) {
        return (
            <View style={styles.center}>
                <Text>Club non trouvé</Text>
            </View>
        );
    }

    const renderContent = () => {
        switch (activeSection) {
            case "Informations":
                return (
                    <InformationSection club={club} onSeeMore={setActiveSection} />
                );

            case "Événements":
                return (
                    <EventSection />
                );

            case "Galerie":
                return (
                    <GalerieSection />
                );

            case "Calendrier":
                return (
                    <ClubCalendar />
                );

            case "Contact":
                return (
                    <ContactSection club={club} />
                );
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}

            <HeaderClubDetails club={club} />

            {/* SECTIONS */}

            <SelectSection SECTIONS={SECTIONS} activeSection={activeSection} setActiveSection={setActiveSection} />

            {/* CONTENU */}

            <View style={styles.content}>{renderContent()}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },

    content: {
        flex: 1,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});