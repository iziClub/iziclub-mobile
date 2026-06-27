import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, ScrollView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons"; // Ou une autre bibliothèque d'icônes si tu n'utilises pas Expo vector icons
import { ClubDetailDTO } from "@/types/club";
import { styles } from "./_styles";

interface ImportedClubDetailProps {
    club: ClubDetailDTO;
}

export default function ImportedClubDetail({ club }: ImportedClubDetailProps) {
    // Coordonnées de fallback si jamais elles manquent dans l'API gouvernementale
    const latitude = 48.8566; 
    const longitude = 2.3522;

    const openNavigation = () => {
        const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${latitude},${longitude}`;
        const label = club.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url).catch((err) => console.error("Impossible d'ouvrir la carte", err));
        }
    };

    return (
        <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
            {/* Badge Info / Statut */}
            <View style={styles.badgeContainer}>
                <View style={styles.tag}>
                    <Ionicons name="cloud-download-outline" size={14} color="#6B7280" />
                    <Text style={styles.tagText}>Données Publiques (Sélection d'État)</Text>
                </View>
            </View>

            {/* Header Info */}
            <View style={styles.headerSection}>
                <Text style={styles.title}>{club.name || "Club sans nom"}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={18} color="#4A78FF" />
                    <Text style={styles.cityText}>{club.city}</Text>
                </View>
            </View>

            {/* Section Adresse */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Adresse</Text>
                <Text style={styles.addressText}>{club.address.street}</Text>
                <Text style={styles.subAddressText}>57570 {club.address.city}</Text>
            </View>

            {/* Section Carte / Navigation */}
            <View style={styles.mapCard}>
                <View style={styles.mapContainer}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                        style={styles.map}
                        initialRegion={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.0121,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude, longitude }} title={club.name} pinColor="#4A78FF" />
                    </MapView>
                </View>

                <TouchableOpacity style={styles.navButton} onPress={openNavigation} activeOpacity={0.8}>
                    <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.navButtonText}>Y aller / Lancer l'itinéraire</Text>
                </TouchableOpacity>
            </View>

            {/* Note d'information UI/UX épurée */}
            <View style={styles.noticeContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
                <Text style={styles.noticeText}>
                    Ce club provient des répertoires officiels. Ses dirigeants n'ont pas encore revendiqué la page sur l'application.
                </Text>
            </View>
        </ScrollView>
    );
}
