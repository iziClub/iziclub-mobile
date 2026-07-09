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

// Fonction utilitaire pour générer un sous-titre propre selon les données du backend
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
    // console.info("Rendering InformationSection with club:", club);
    
    // Couleurs par défaut à boucler si le backend renvoie null
    const defaultColors = ["#D42E2F", "#D85D12", "#F9BC12", "#007AFF", "#28A745", "#6F42C1"];
    const router = useRouter();
    return (
        <ScrollView
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 60,
            }}
        >
            <Image source={{ uri: club.profile.bannerPath }} style={styles.banner} />

            <View style={styles.infoBlock}>
                <Text style={styles.title}>{club.name}</Text>
                {club.profile.slogan ? <Text style={styles.subtitle}>{club.profile.slogan}</Text> : null}
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
                            <Card
                                key={event.id}
                                title={event.name}
                                banner={event.banner_url ?? "https://via.placeholder.com/300x150"}
                                address={`${event.address.street}, ${event.address.city}`}
                                distance_km={event.distance_km}
                                tags={[event.sport || "Sport non précisé", event.type]}
                                type="event"
                                onPress={() => router.push(`/search/event/${event.id}`) }
                                width={220}
                            />
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
                            // Utilise la couleur du backend ou pioche dans la liste par défaut
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
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
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
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
    bigTitle: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 12,
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