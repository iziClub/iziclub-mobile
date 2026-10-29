import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { Club } from "@/types/club";
import { likeClub, unlikeClub, saveClub, unsaveClub } from "@/services/clubs.service";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import IconButton from "@/components/ui/IconButton";

interface HeaderClubDetailsProps {
  club: Club;
  initialIsLiked?: boolean;
  initialIsSaved?: boolean;
  isLoggedIn?: boolean;
  from?: string;
  onSharePress?: () => void;
}

export default function HeaderClubDetails({ 
  club, 
  initialIsLiked = false, 
  initialIsSaved = false,
  isLoggedIn = false,
  from,
  onSharePress,
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

  const handleGoBack = () => {
    if (from === 'myClubs') {
      router.replace('/profile/myClubs');
      return;
    }

    if (from === 'search') {
      router.replace('/search');
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/search');
    }
  };

  return (
    <View style={styles.header}>
      {/* Bouton Retour */}
      <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={handleGoBack} />

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
        <IconButton
          name={isLiked ? "heart" : "heart-outline"}
          variant="fantome"
          iconSize={24}
          color={isLiked ? Colors.rouge : Colors.noir}
          accessibilityLabel={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
          accessibilityState={{ selected: isLiked }}
          onPress={handleToggleLike}
          loading={loadingLike}
          style={!isLoggedIn && styles.actionButtonDisabled}
        />

        {/* BOUTON SAVE */}
        <IconButton
          name={isSaved ? "bookmark" : "bookmark-border"}
          variant="fantome"
          iconSize={24}
          accessibilityLabel={isSaved ? "Retirer des enregistrés" : "Enregistrer"}
          accessibilityState={{ selected: isSaved }}
          onPress={handleToggleSave}
          loading={loadingSave}
          style={!isLoggedIn && styles.actionButtonDisabled}
        />

        {/* BOUTON PARTAGE */}
        {onSharePress && (
          <IconButton
            name="share-social-outline"
            variant="fantome"
            iconSize={24}
            accessibilityLabel="Partager"
            onPress={onSharePress}
          />
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.grisClair,
    backgroundColor: Colors.blanc,
  },
  clubInfo: { 
    marginRight: 12, 
    alignItems: "flex-end",
    flexShrink: 1,
  },
  clubName: { 
    fontSize: 16, 
    fontFamily: Fonts.medium,
    color: Colors.noir,
  },
  clubCity: { 
    fontSize: 12, fontFamily: Fonts.regular, 
    color: Colors.grisTexte,
    marginTop: 2,
  },
  clubImage: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    marginRight: 12,
    backgroundColor: Colors.fond,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
});