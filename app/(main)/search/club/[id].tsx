import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import ClubCalendar from "@/components/calendar";
import EventSection from "@/components/club/eventSection";
import ContactSection from "@/components/club/contactSection";
import InformationSection from "@/components/club/informationSection";
import MembershipSection from "@/components/club/Membership/MembershipSection"
import HeaderClubDetails from "@/components/club/headerClubDetails";
import SelectSection from "@/components/club/selectSection";
import { getClubById, getGalleryImagesByClubId, getCategoryByClubId, getSessionsByClubId, getClubStatus } from "@/services/clubs.service";
import { mapApiClubToDetail } from "@/mappers/club.mapper";
import { getEventsByClubId } from "@/services/events.service";
import { Club } from "@/types/club";
import { useAuth } from "../../../../context/AuthContext";
import { useLocation } from "../../../../context/LocationContext";
import ImportedClubDetail from "./importClubDetail";
import { getCurrentUser } from "@/services/auth";
import { Colors } from "@/constants/colors";

const SECTIONS = ["Informations", "Événements", "Adhésion", "Calendrier", "Contact"];

export default function ClubDetail() {
    const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [club, setClub] = useState<Club>();
    const { user } = useAuth();
    const { location } = useLocation();
    const [userData, setUserData] = useState<any>(null);

    const isLoggedIn = !!user;
    useEffect(() => {
        const fetchClubData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const locationParams = {
                  latitude: location?.latitude ?? 48.8566,
                  longitude: location?.longitude ?? 2.3522,
                  radiusInKm: 1500,
                };
                                const dataClub = await getClubById(id, locationParams);
                const eventsFromClub = await getEventsByClubId(id, locationParams);
                const galleryImages = await getGalleryImagesByClubId(id);
                const categories = await getCategoryByClubId(id);
                const sessions = await getSessionsByClubId(id);
                                const apiClub = dataClub.data[0];
                                if (!apiClub) throw new Error("Club not found");
                                const status = isLoggedIn ? await getClubStatus(id) : undefined;
                                const mappedDataClub = mapApiClubToDetail({
                                    ...apiClub,
                                    events: eventsFromClub.data,
                                    gallery: galleryImages.data,
                                    categories: categories.data,
                                    sessions: sessions.data,
                                    status,
                                });
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
    }, [id, isLoggedIn, location?.latitude, location?.longitude]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.noir} />
            </View>
        );
    }

    if (!club) {
        return (
            <View style={styles.center}>
                <Text style={{ color: Colors.noir }}>Club non trouvé</Text>
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

    // type et city viennent de l'API : on n'en fait des mots-clés que si ce sont bien des textes.
    const shareTags = ["iziclub", "sport", club.type, club.city]
      .map((tag) => (typeof tag === "string" ? tag.toLowerCase().replace(/\s+/g, "") : ""))
      .filter(Boolean)
      .map((tag) => `#${tag}`)
      .join(" ");

    const shareImage = club.profile.profileImagePath || club.profile.bannerPath;

    const shareMessage = `Regarde ce club !\n\n🏆 ${club.name}\n📍 ${club.city}\n${club.profile.slogan || club.profile.description || "Un club à découvrir sur iziclub."}\n\n${shareTags}\n\nDécouvre ce club sur iziclub : https://iziclub.fr`;

    const handleNativeShare = async () => {
        try {
            await Share.share({
                message: shareMessage,
                title: `Regarde ce club : ${club.name}`,
                url: shareImage ?? undefined,
            });
        } catch (error) {
            console.error("Erreur partage natif :", error);
        }
    };

    return (
        
        <View style={styles.container}>
            {/* HEADER */}

            <HeaderClubDetails
                club={club}
                isLoggedIn={isLoggedIn}
                from={from}
                onSharePress={handleNativeShare}
            />

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
        backgroundColor: Colors.fond,
    },

    content: {
        flex: 1,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.fond,
    },
});