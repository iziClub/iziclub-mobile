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
import { Ionicons } from "@expo/vector-icons";
import { EngagementItem, useEngagement } from "./useEngagement";

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
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
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
        <Ionicons
          name={active ? activeIcon : inactiveIcon}
          size={24}
          color={active ? activeColor : "#444"}
        />
      </Animated.View>
      <Text style={[styles.iconButtonLabel, active && { color: activeColor, fontWeight: "700" }]}>
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
};

export default function EngagementBar({
  item,
  initialLiked = false,
  initialSaved = false,
  initialParticipating = false,
  initialLikeCount = 0,
}: Props) {
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

  const handleParticipationPress = () => {
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
          onPress={toggleLike}
          activeIcon="heart"
          inactiveIcon="heart-outline"
          activeColor="#E63946"
          label={state.likeCount > 0 ? `${state.likeCount} J'aime` : "J'aime"}
        />

        {/* SAVE */}
        <ActionButton
          active={state.saved}
          onPress={toggleSave}
          activeIcon="bookmark"
          inactiveIcon="bookmark-outline"
          activeColor="#4A78FF"
          label="Enregistrer"
        />

        {/* PARTICIPER (Affiché uniquement si c'est un événement) */}
        {isEvent && (
          <ActionButton
            active={state.participating}
            onPress={handleParticipationPress}
            activeIcon="checkmark-circle"
            inactiveIcon="person-add-outline"
            activeColor="#28a745"
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
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around", // Aligne les 3 boutons équitablement sur la ligne
    width: "100%",
  },
  iconRowCentered: {
    justifyContent: "space-around",
    paddingHorizontal: "15%", // Centre harmonieusement s'il n'y a que 2 boutons (Clubs)
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 5,
    paddingVertical: 4,
  },
  iconButtonLabel: {
    fontSize: 11,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 2,
    flexWrap: "wrap",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
});