import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { getMyClubRating, saveMyClubRating } from "@/services/clubRating.service";

const SCORES = [1, 2, 3, 4, 5];

/** Carte « Noter le club », affichée aux membres du club uniquement. */
export default function ClubRatingCard({ clubId }: { clubId: string }) {
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getMyClubRating(clubId)
      .then((rating) => {
        if (!active) return;
        setSavedScore(rating?.score ?? null);
        setScore(rating?.score ?? 0);
        setLoaded(true);
      })
      // Pas membre ou réseau coupé : on n'affiche pas la carte.
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [clubId]);

  if (!loaded) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const rating = await saveMyClubRating(clubId, score, savedScore !== null);
      setSavedScore(rating.score);
      Alert.alert("Merci !", "Ta note a bien été enregistrée.");
    } catch {
      Alert.alert("Note non enregistrée", "Une erreur est survenue. Réessaie dans un instant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Noter le club</Text>
      <Text style={styles.subtitle}>
        {savedScore !== null ? "Tu peux modifier ta note à tout moment." : "Ton avis aide le club à s'améliorer."}
      </Text>
      <View style={styles.stars}>
        {SCORES.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`${value} sur 5`}
            accessibilityState={{ selected: value <= score }}
            hitSlop={6}
            onPress={() => setScore(value)}
          >
            <Icon name={value <= score ? "star" : "star-outline"} size={32} color={value <= score ? Colors.noir : Colors.gris} />
          </Pressable>
        ))}
      </View>
      <Button
        label={savedScore !== null ? "Modifier ma note" : "Valider ma note"}
        variant="secondaire"
        fullWidth
        loading={saving}
        disabled={score === 0 || score === savedScore || saving}
        onPress={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  title: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  subtitle: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte },
  stars: { flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 4 },
});
