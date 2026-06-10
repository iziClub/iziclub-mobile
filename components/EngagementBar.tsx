/**
 * EngagementBar.tsx
 *
 * Barre d'actions réutilisable affichée sur les écrans Événement et Club.
 * Gère : Like · Enregistrer · Participer (event uniquement)
 *
 * Usage sur EventDetailScreen :
 *   <EngagementBar item={{ id: event.id, kind: "event", name: event.name, ... }} />
 *
 * Usage sur ClubDetailScreen :
 *   <EngagementBar item={{ id: club.id, kind: "club", name: club.name, ... }} />
 */

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
        toValue: 1.35,
        useNativeDriver: true,
        speed: 40,
        bounciness: 14,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
    ]).start();
  };

  return { scale, bounce };
}

// ─────────────────────────────────────────────────────────
// Sous-composant : un bouton d'action
// ─────────────────────────────────────────────────────────
type ActionButtonProps = {
  active: boolean;
  onPress: () => void;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  activeColor: string;
  label: string;
  subLabel?: string; // ex: "12 likes"
  disabled?: boolean;
  variant?: "pill" | "icon"; // pill = bouton plein avec texte, icon = icône seule
};

function ActionButton({
  active,
  onPress,
  activeIcon,
  inactiveIcon,
  activeColor,
  label,
  subLabel,
  disabled,
  variant = "icon",
}: ActionButtonProps) {
  const { scale, bounce } = useScaleBounce();

  const handlePress = () => {
    if (disabled) return;
    bounce();
    onPress();
  };

  if (variant === "pill") {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={disabled}
        style={[
          styles.pillButton,
          active ? { backgroundColor: activeColor } : styles.pillButtonInactive,
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={active ? activeIcon : inactiveIcon}
            size={18}
            color={active ? "#fff" : "#555"}
          />
        </Animated.View>
        <Text
          style={[
            styles.pillButtonText,
            { color: active ? "#fff" : "#555" },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

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
          size={26}
          color={active ? activeColor : "#888"}
        />
      </Animated.View>
      {subLabel ? (
        <Text style={[styles.iconButtonSub, active && { color: activeColor }]}>
          {subLabel}
        </Text>
      ) : (
        <Text style={styles.iconButtonLabel}>{label}</Text>
      )}
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
  onCalendarPress?: () => void; // fourni par le parent (confirmAddToCalendar)
};

export default function EngagementBar({
  item,
  initialLiked = false,
  initialSaved = false,
  initialParticipating = false,
  initialLikeCount = 0,
  onCalendarPress,
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

  return (
    <View style={styles.container}>
      {/* ── Ligne 1 : icônes Like + Save ── */}
      <View style={styles.iconRow}>
        {/* LIKE */}
        <ActionButton
          active={state.liked}
          onPress={toggleLike}
          activeIcon="heart"
          inactiveIcon="heart-outline"
          activeColor="#E63946"
          label="J'aime"
          subLabel={
            state.likeCount > 0 ? `${state.likeCount}` : undefined
          }
        />

        {/* SAVE */}
        <ActionButton
          active={state.saved}
          onPress={toggleSave}
          activeIcon="bookmark"
          inactiveIcon="bookmark-outline"
          activeColor="#1C52D2"
          label="Enregistré"
          subLabel={state.saved ? "Enregistré" : "Enregistrer"}
        />

        {/* CALENDRIER — event uniquement, icône seule */}
        {isEvent && onCalendarPress && (
          <ActionButton
            active={false}
            onPress={onCalendarPress}
            activeIcon="calendar"
            inactiveIcon="calendar-outline"
            activeColor="#1C52D2"
            label="Calendrier"
            subLabel="Calendrier"
          />
        )}
      </View>

      {/* ── Ligne 2 : bouton Participer (event uniquement) ── */}
      {isEvent && (
        <View style={styles.participateRow}>
          <ActionButton
            variant="pill"
            active={state.participating}
            onPress={() => {
              toggleParticipation();
              if (!state.participating) {
                // Feedback positif à l'inscription
                Alert.alert(
                  "Participation confirmée 🎉",
                  `Tu es inscrit·e à "${item.name}" !`,
                  [{ text: "Super !", style: "default" }]
                );
              }
            }}
            activeIcon="checkmark-circle"
            inactiveIcon="person-add-outline"
            activeColor="#28a745"
            label={state.participating ? "Je participe ✓" : "Je participe"}
          />

          {state.participating && (
            <TouchableOpacity
              style={styles.cancelParticipation}
              onPress={() => {
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
              }}
            >
              <Text style={styles.cancelText}>Se désinscrire</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Badges de statut ── */}
      {(state.saved || state.liked || state.participating) && (
        <View style={styles.statusRow}>
          {state.liked && (
            <View style={[styles.statusBadge, { backgroundColor: "#FFF0F0" }]}>
              <Ionicons name="heart" size={11} color="#E63946" />
              <Text style={[styles.statusBadgeText, { color: "#E63946" }]}>
                Aimé
              </Text>
            </View>
          )}
          {state.saved && (
            <View style={[styles.statusBadge, { backgroundColor: "#F0F4FF" }]}>
              <Ionicons name="bookmark" size={11} color="#1C52D2" />
              <Text style={[styles.statusBadgeText, { color: "#1C52D2" }]}>
                Enregistré
              </Text>
            </View>
          )}
          {state.participating && (
            <View style={[styles.statusBadge, { backgroundColor: "#F0FFF4" }]}>
              <Ionicons name="checkmark-circle" size={11} color="#28a745" />
              <Text style={[styles.statusBadgeText, { color: "#28a745" }]}>
                Inscrit·e
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    // Ombre légère
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  // ── Icône row ──
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  iconButton: {
    alignItems: "center",
    gap: 4,
    minWidth: 52,
  },
  iconButtonLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    textAlign: "center",
  },
  iconButtonSub: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    textAlign: "center",
  },
  // ── Pill button ──
  participateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    // Ombre sur le bouton
    ...Platform.select({
      ios: {
        shadowColor: "#28a745",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  pillButtonInactive: {
    backgroundColor: "#EFEFEF",
    borderWidth: 1.5,
    borderColor: "#DDD",
  },
  pillButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cancelParticipation: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 13,
    color: "#E63946",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  // ── Status badges ──
  statusRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});