import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Club } from "@/types/club";

export default function HeaderClubDetails({ club }: { club: Club }) {
    const router = useRouter();

    return (
        <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubCity}>{club.city}</Text>
                </View>

                <Image source={{ uri: club.profile_image_url }} style={styles.clubImage} />

                <TouchableOpacity style={styles.saveButton}>
                    <MaterialIcons name="bookmark-border" size={28} color="#000" />
                </TouchableOpacity>
            </View>
    );
}

const styles = StyleSheet.create({
        header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
    },

    backButton: { padding: 6 },
    
    backArrow: { fontSize: 22 },

    clubInfo: { marginRight: 8, alignItems: "flex-end" },

    clubName: { fontSize: 18, fontWeight: "bold" },

    clubCity: { fontSize: 12, color: "#666" },

    clubImage: { width: 50, height: 50, borderRadius: 25, marginRight: 8 },

    saveButton: { padding: 6 },
});