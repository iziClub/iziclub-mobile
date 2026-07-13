import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import ClubCalendar from "@/components/calendar";
import EventSection from "@/components/club/eventSection";
import GalerieSection from "@/components/club/galerieSection";
import ContactSection from "@/components/club/contactSection";
import InformationSection from "@/components/club/informationSection";
import MembershipSection from "@/components/club/Membership/MembershipSection"
import HeaderClubDetails from "@/components/club/headerClubDetails";
import SelectSection from "@/components/club/selectSection";
import { getClubById, getGalleryImagesByClubId, getCategoryByClubId, getSessionsByClubId, getClubStatus } from "@/services/clubs.service";
import { mapApiClubToDetail } from "@/mappers/club.mapper";
import { getEventsByClubId } from "@/services/events.service";
import { ClubDetailDTO } from "@/types/club";
import { useAuth } from "../../../../context/AuthContext";
import ImportedClubDetail from "./importClubDetail";
import { getCurrentUser } from "@/services/auth";

const SECTIONS = ["Informations", "Événements", "Adhésion","Galerie", "Calendrier", "Contact"];

export default function ClubDetail() {
    const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [club, setClub] = useState<ClubDetailDTO>();
    const { user } = useAuth()
    const [userData, setUserData] = useState<any>(null);

    const isLoggedIn = !!user;
    useEffect(() => {
        const fetchClubData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const dataClub = await getClubById(id);
                const eventsFromClub = await getEventsByClubId(id);
                dataClub.data[0].events = eventsFromClub.data; // Ajoute les événements au club
                const galleryImages = await getGalleryImagesByClubId(id);
                dataClub.data[0].gallery = galleryImages.data;
                const categories = await getCategoryByClubId(id);
                dataClub.data[0].categories = categories.data;
                const sessions = await getSessionsByClubId(id);
                dataClub.data[0].sessions = sessions.data;

                if (isLoggedIn) {
                    const status = await getClubStatus(id);
                    dataClub.data[0].status = status;
                }

                const mappedDataClub = mapApiClubToDetail(dataClub.data[0]);
                setClub(mappedDataClub);

                if (isLoggedIn) {
                    const userResponse = await getCurrentUser();
                    setUserData(userResponse);
                } else {
                    setUserData(null);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du club:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClubData();
    }, [id, isLoggedIn]);

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
    const isImportedClub = !club.profile.bannerPath && !club.profile.profileImagePath;

    // if (isImportedClub) {
    //     return <ImportedClubDetail club={club} />;
    // }

    const renderContent = () => {
        switch (activeSection) {
            case "Informations":
                return (
                    <InformationSection club={club} onSeeMore={setActiveSection} />
                );

            case "Événements":
                return (
                    <EventSection events={club.events} />
                );
            case "Adhésion":
                return (
                    <MembershipSection 
                        club={club} 
                        user={userData} // Passe les données de l'utilisateur ici
                        isLoggedIn={isLoggedIn} // À remplacer par ton vrai état de connexion (ex: via useAuth)
                    />
                );      

            case "Galerie":
                return (
                    <GalerieSection club={club}/>
                );

            case "Calendrier":
                return (
                    <ClubCalendar sessions={club.sessions} />
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

            <HeaderClubDetails club={club} isLoggedIn={isLoggedIn} from={from} />

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