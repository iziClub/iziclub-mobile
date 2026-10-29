import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import ImageViewer from "./ImageViewer";
import Card from "../card";
import TeamCard from "../teamCard";
import { Club } from "@/types/club";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Button from "@/components/ui/Button";

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
    const defaultColors = [Colors.vert, Colors.bleu, Colors.rouge, Colors.vertClair, Colors.bleuClair];
    const router = useRouter();
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    
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
                        <Button variant="lien" label="Voir plus" onPress={() => onSeeMore("Événements")} />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12, paddingRight: 16, marginBottom: 24 }}
                    >
                        {club.events.map((event) => (
                            <View key={event.id} >
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
                    </View>

                    <View style={styles.gallery}>
                        {club.gallery.slice(0, 16).map((picture, index) => (
                            <Pressable
                                key={picture.id}
                                accessibilityRole="imagebutton"
                                accessibilityLabel={`Agrandir la photo ${index + 1}`}
                                style={({ pressed }) => [styles.photoWrap, pressed && { opacity: 0.85 }]}
                                onPress={() => setViewerIndex(index)}
                            >
                                <Image source={{ uri: picture.url }} style={styles.photo} />
                            </Pressable>
                        ))}
                    </View>

                    <ImageViewer
                        images={club.gallery.slice(0, 16).map((p) => p.url)}
                        index={viewerIndex}
                        onClose={() => setViewerIndex(null)}
                    />
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    banner: {
        width: "100%",
        height: 180,
        borderRadius: 16,
        marginBottom: 16,
    },
    infoBlock: {
        marginBottom: 24,
    },
    infoBlockNoBanner: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.grisClair,
        paddingBottom: 20,
        marginBottom: 28,
    },
    title: {
        fontSize: 24,
        fontFamily: Fonts.titre,
        marginBottom: 4,
        color: Colors.noir,
    },
    titleNoBanner: {
        fontSize: 32,
        fontFamily: Fonts.titre,
        letterSpacing: -0.5,
        color: Colors.noir,
    },
    subtitle: {
        fontSize: 16, fontFamily: Fonts.regular,
        color: Colors.grisTexte,
        fontStyle: "italic",
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 16, fontFamily: Fonts.regular,
        color: Colors.noir,
        lineHeight: 22,
        marginTop: 4,
    },
    bigTitle: {
        fontSize: 20,
        fontFamily: Fonts.titre,
        color: Colors.noir,
        marginBottom: 16,
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
    photoWrap: {
        width: "49%",
        marginBottom: 12,
    },
    photo: {
        width: "100%",
        height: 150,
        borderRadius: 16,
    },
});