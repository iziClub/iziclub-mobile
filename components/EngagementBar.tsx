import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { EngagementItem, useEngagement } from "./useEngagement";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

// ─────────────────────────────────────────────────────────
// Micro-animation : scale bounce sur press
// ─────────────────────────────────────────────────────────
function useScaleBounce() {
  const scale = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
    ]).start();
  };

  return { scale, bounce };
}

// ─────────────────────────────────────────────────────────
// Sous-composant : un bouton d'action aligné
// ─────────────────────────────────────────────────────────
type ActionButtonProps = {
  active: boolean;
  onPress: () => void;
  activeIcon: string;
  inactiveIcon: string;
  activeColor: string;
  label: string;
  disabled?: boolean;
};

function ActionButton({
  active,
  onPress,
  activeIcon,
  inactiveIcon,
  activeColor,
  label,
  disabled,
}: ActionButtonProps) {
  const { scale, bounce } = useScaleBounce();

  const handlePress = () => {
    if (disabled) return;
    bounce();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
      style={styles.iconButton}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name={active ? activeIcon : inactiveIcon}
          size={24}
          color={active ? activeColor : Colors.noir}
        />
      </Animated.View>
      <Text style={[styles.iconButtonLabel, active && { color: activeColor, fontFamily: Fonts.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────
type Props = {
  item: EngagementItem;
  initialLiked?: boolean;
  initialSaved?: boolean;
  initialParticipating?: boolean;
  initialLikeCount?: number;
  isLoggedIn?: boolean;
};

export default function EngagementBar({
  item,
  initialLiked = false,
  initialSaved = false,
  initialParticipating = false,
  initialLikeCount = 0,
  isLoggedIn = false,
}: Props) {
  const router = useRouter();
  const { state, toggleLike, toggleSave, toggleParticipation } = useEngagement(
    item,
    {
      liked: initialLiked,
      saved: initialSaved,
      participating: initialParticipating,
      likeCount: initialLikeCount,
    }
  );

  const isEvent = item.kind === "event";

  const promptLogin = () => {
    Alert.alert(
      "Connexion requise",
      "Connectez-vous ou créez un compte pour liker, enregistrer ou participer à cet événement.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Se connecter", onPress: () => router.push("/(auth)/login") },
        { text: "Créer un compte", onPress: () => router.push("/(auth)/register") },
      ]
    );
  };

  const handleLikePress = () => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }
    toggleLike();
  };

  const handleSavePress = () => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }
    toggleSave();
  };

  const handleParticipationPress = () => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }
    if (state.participating) {
      // Option de désinscription si déjà actif
      Alert.alert(
        "Retirer ma participation",
        `Es-tu sûr·e de vouloir te désinscrire de "${item.name}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Me désinscrire",
            style: "destructive",
            onPress: toggleParticipation,
          },
        ]
      );
    } else {
      // Inscription
      toggleParticipation();
      Alert.alert(
        "Participation confirmée 🎉",
        `Tu es inscrit·e à "${item.name}" ! Retrouve ton dossier dans ton profil.`,
        [{ text: "Super !", style: "default" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Ligne unique d'actions homogènes ── */}
      <View style={[styles.iconRow, !isEvent && styles.iconRowCentered]}>
        {/* LIKE */}
        <ActionButton
          active={state.liked}
          onPress={handleLikePress}
          activeIcon="heart"
          inactiveIcon="heart-outline"
          activeColor={Colors.rouge}
          label={state.likeCount > 0 ? `${state.likeCount} J'aime` : "J'aime"}
        />

        {/* SAVE */}
        <ActionButton
          active={state.saved}
          onPress={handleSavePress}
          activeIcon="bookmark"
          inactiveIcon="bookmark-outline"
          activeColor={Colors.noir}
          label="Enregistrer"
        />

        {/* PARTICIPER (Affiché uniquement si c'est un événement) */}
        {isEvent && (
          <ActionButton
            active={state.participating}
            onPress={handleParticipationPress}
            activeIcon="checkmark-circle"
            inactiveIcon="person-add-outline"
            activeColor={Colors.vert}
            label={state.participating ? "Inscrit·e" : "Participer"}
          />
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Styles épurés
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: Colors.blanc,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.noir,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  iconRowCentered: {
    justifyContent: "space-around",
    paddingHorizontal: "15%",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 4,
    paddingVertical: 4,
  },
  iconButtonLabel: {
    fontSize: 12,
    color: Colors.grisTexte,
    fontFamily: Fonts.medium,
    textAlign: "center",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 2,
    flexWrap: "wrap",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
});