import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function GalerieSection() {
    return (
        <ScrollView style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Galerie photos</Text>
            <View style={styles.gallery}>
                            {Array.from({ length: 12 }).map((_, i) => (
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
