import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Club } from "@/types/club";
import { likeClub, unlikeClub, saveClub, unsaveClub } from "@/services/clubs.service"; // Adjust path as needed

interface HeaderClubDetailsProps {
  club: Club;
  initialIsLiked?: boolean;
  initialIsSaved?: boolean;
  isLoggedIn?: boolean;
}

export default function HeaderClubDetails({ 
  club, 
  initialIsLiked = false, 
  initialIsSaved = false,
  isLoggedIn = false,
}: HeaderClubDetailsProps) {
  const router = useRouter();

  // États locaux pour gérer le Like et le Save
  const [isLiked, setIsLiked] = useState<boolean>(club.status?.isLiked ?? initialIsLiked);
  const [isSaved, setIsSaved] = useState<boolean>(club.status?.isSaved ?? initialIsSaved);

  // Loaders individuels pour éviter les double-clics pendant la requête
  const [loadingLike, setLoadingLike] = useState<boolean>(false);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  const promptLogin = () => {
    Alert.alert(
      "Connexion requise",
      "Connectez-vous ou créez un compte pour liker ou enregistrer ce club.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Se connecter", onPress: () => router.push("/(auth)/login") },
        { text: "Créer un compte", onPress: () => router.push("/(auth)/register") },
      ]
    );
  };

  // Handler pour le Like / Unlike
  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }

    if (loadingLike) return;
    setLoadingLike(true);

    // Optimistic UI Update (mise à jour visuelle instantanée)
    const previousState = isLiked;
    setIsLiked(!previousState);

    try {
      if (previousState) {
        await unlikeClub(club.id);
      } else {
        await likeClub(club.id);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion du like :", error);
      setIsLiked(previousState); // Rollback en cas d'erreur API
    } finally {
      setLoadingLike(false);
    }
  };

  // Handler pour le Save / Unsave
  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }

    if (loadingSave) return;
    setLoadingSave(true);

    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      if (previousState) {
        await unsaveClub(club.id);
      } else {
        await saveClub(club.id);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion du save :", error);
      setIsSaved(previousState); // Rollback en cas d'erreur API
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <View style={styles.header}>
      {/* Bouton Retour */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      {/* Informations sur le Club */}
      <View style={styles.clubInfo}>
        <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
        <Text style={styles.clubCity} numberOfLines={1}>{club.city}</Text>
      </View>

      {/* Image de profil */}
      <Image 
        source={{ 
          uri: club.profile?.profileImagePath || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=200&auto=format&fit=crop' 
        }} 
        style={styles.clubImage} 
      />

      {/* Actions (Like & Save) */}
      <View style={styles.actionsContainer}>
        {/* BOUTON LIKE */}
        <TouchableOpacity 
          onPress={handleToggleLike} 
          style={[styles.actionButton, !isLoggedIn && styles.actionButtonDisabled]}
          disabled={loadingLike}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          {loadingLike ? (
            <ActivityIndicator size="small" color="#FF5A5F" />
          ) : (
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#FF5A5F" : "#1A1A1A"} 
            />
          )}
        </TouchableOpacity>

        {/* BOUTON SAVE */}
        <TouchableOpacity 
          onPress={handleToggleSave} 
          style={[styles.actionButton, !isLoggedIn && styles.actionButtonDisabled]}
          disabled={loadingSave}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        >
          {loadingSave ? (
            <ActivityIndicator size="small" color="#4A78FF" />
          ) : (
            <MaterialIcons 
              name={isSaved ? "bookmark" : "bookmark-border"} 
              size={26} 
              color={isSaved ? "#4A78FF" : "#1A1A1A"} 
            />
          )}
        </TouchableOpacity>
      </View>
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
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFF",
  },
  backButton: { 
    padding: 6,
    borderRadius: 8,
  },
  clubInfo: { 
    marginRight: 10, 
    alignItems: "flex-end",
    flexShrink: 1,
  },
  clubName: { 
    fontSize: 16, 
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  clubCity: { 
    fontSize: 12, 
    color: "#8E8E93",
    marginTop: 2,
  },
  clubImage: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    marginRight: 10,
    backgroundColor: '#F2F2F7',
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: { 
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 36,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
});