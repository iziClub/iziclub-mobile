import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Club } from "@/types/club";
import { Picture } from "@/types/picture";

interface Props {
    club: Club;
}

export default function GalerieSection({club}: Props) {
    return (
        <ScrollView style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Galerie photos</Text>
            <View style={styles.gallery}>
                            {club.gallery.map((picture: Picture) =>(
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
    sectionContainer: {
        padding: 20,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 10,
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
