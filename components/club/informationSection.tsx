import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import Card from "../card";
import TeamCard from "../teamCard";
import { Club } from "@/types/club";
import { useRouter } from "expo-router";

interface Props {
    club: Club;
    onSeeMore: (section: string) => void;
}

const getCategorySubtitle = (gender: string | null, minAge: number | null, maxAge: number | null) => {
    let genderLabel = "Mixte";
    if (gender === "male") genderLabel = "Homme";
    if (gender === "female") genderLabel = "Femme";

    if (minAge && maxAge) {
        return `${genderLabel} • ${minAge}-${maxAge} ans`;
    } else if (minAge && !maxAge) {
        return `${genderLabel} • +${minAge} ans`;
    } else if (!minAge && maxAge) {
        return `${genderLabel} • Max ${maxAge} ans`;
    }
    return genderLabel;
};

export default function InformationSection({ club, onSeeMore }: Props) {
    const defaultColors = ["#D42E2F", "#D85D12", "#F9BC12", "#007AFF", "#28A745", "#6F42C1"];
    const router = useRouter();
    
    // On vérifie si la bannière existe
    const hasBanner = !!club.profile.bannerPath;

    return (
        <ScrollView
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 60,
                // On ajoute un petit padding top si pas de bannière pour ne pas coller au haut de l'écran
                paddingTop: hasBanner ? 0 : 16, 
            }}
        >
            {/* On n'affiche l'image QUE si elle existe. Pas de fallback gris artificiel. */}
            {hasBanner && (
                <Image source={{ uri: club.profile.bannerPath }} style={styles.banner} />
            )}

            {/* Si pas de bannière, on applique un style "header" plus aéré et flatteur */}
            <View style={[styles.infoBlock, !hasBanner && styles.infoBlockNoBanner]}>
                <Text style={[styles.title, !hasBanner && styles.titleNoBanner]}>
                    {club.name}
                </Text>
                {club.profile.slogan ? (
                    <Text style={styles.subtitle}>{club.profile.slogan}</Text>
                ) : null}
                <Text style={styles.description}>{club.profile.description}</Text>
            </View>

            {/* SECTION ÉVÉNEMENTS */}
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
                            <View key={event.id} style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                            <Card
                                title={event.name}
                                banner={event.coverImagePath ?? "https://via.placeholder.com/300x150"}
                                address={`${event.address.street}, ${event.address.city}`}
                                distanceInKm={event.distanceInKm}
                                tags={[event.sport || "Sport non précisé", event.type]}
                                type="event"
                                onPress={() => router.push(`/search/event/${event.id}`) }
                                width={220}
                            />
                            </View>
                        ))}
                    </ScrollView>
                </>
            )}

            {/* SECTION ÉQUIPES / CATÉGORIES */}
            {club.categories && club.categories.length > 0 && (
                <>
                    <Text style={styles.bigTitle}>Nos équipes</Text>
                    <View style={styles.teamContainer}>
                        {club.categories.map((category, index) => {
                            const cardColor = category.color || defaultColors[index % defaultColors.length];
                            const subtitle = getCategorySubtitle(category.gender, category.minAge, category.maxAge);

                            return (
                                <View key={category.id} style={styles.teamItem}>
                                    <TeamCard 
                                        title={category.name} 
                                        color={cardColor} 
                                        subtitle={subtitle} 
                                        />
                                </View>
                            );
                        })}
                    </View>
                </>
            )}

            {/* SECTION PHOTOS */}
            {club.gallery && club.gallery.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.bigTitle}>Nos photos</Text>
                        <TouchableOpacity onPress={() => onSeeMore("Galerie")}>
                            <Text style={styles.seeMore}>Voir plus</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.gallery}>
                        {club.gallery.slice(0, 6).map((picture) => (
                            <Image
                                key={picture.id}
                                source={{ uri: picture.url }}
                                style={styles.photo} 
                            />
                        ))}
                    </View>
                </>
            )}
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
    // Nouveau style si pas de bannière : ajoute une légère bordure basse discrète pour structurer
    infoBlockNoBanner: {
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        paddingBottom: 20,
        marginBottom: 28,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
        color: "#1A1A1A",
    },
    // Si pas de bannière, on grossit un poil le titre pour marquer l'identité visuelle du club
    titleNoBanner: {
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        fontStyle: "italic",
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
        color: "#007AFF",
        fontWeight: "600",
    },
    description: {
        fontSize: 15,
        color: "#4A4A4A",
        lineHeight: 22, // Améliore la lisibilité du texte
        marginTop: 4,
    },
    bigTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 14,
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