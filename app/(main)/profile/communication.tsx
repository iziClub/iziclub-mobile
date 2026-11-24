import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMemberClubs } from '@/services/clubs.service';
import {
  ClubNotificationPreferences,
  getClubNotificationPreferences,
  updateClubNotificationPreferences,
} from '@/services/notificationPreferences.service';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';

type ClubPreferences = ClubNotificationPreferences & { clubName: string };
type PreferenceKey = 'announcements' | 'eventUpdates';

const ROWS: { key: PreferenceKey; label: string; hint: string }[] = [
  { key: 'eventUpdates', label: 'Actualités des événements', hint: 'Changement de date, annulation...' },
  { key: 'announcements', label: 'Annonces du club', hint: 'Les messages envoyés aux membres' },
];

/** Préférences de communication par e-mail, club par club. */
export default function CommunicationScreen() {
  const insets = useSafeAreaInsets();
  const [clubs, setClubs] = useState<ClubPreferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const memberClubs = (await getMemberClubs()).data ?? [];
          const preferences = await Promise.all(
            memberClubs.map(async (club) => ({
              ...(await getClubNotificationPreferences(club.id)),
              clubName: club.name,
            }))
          );
          if (!active) return;
          setClubs(preferences);
          setFailed(false);
        } catch {
          if (active) setFailed(true);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => {
        active = false;
      };
    }, [])
  );

  const toggle = async (clubId: string, key: PreferenceKey, value: boolean) => {
    const apply = (next: boolean) =>
      setClubs((prev) => prev.map((club) => (club.clubId === clubId ? { ...club, [key]: next } : club)));
    apply(value);
    try {
      await updateClubNotificationPreferences(clubId, { [key]: value });
    } catch {
      apply(!value);
      Alert.alert('Préférence non enregistrée', 'Une erreur est survenue. Réessaie dans un instant.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Communication</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.noir} />
        </View>
      ) : failed ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Chargement impossible</Text>
          <Text style={styles.emptyText}>Vérifie ta connexion et réessaie.</Text>
        </View>
      ) : clubs.length === 0 ? (
        <View style={styles.center}>
          <Icon name="notifications-outline" size={56} color={Colors.gris} />
          <Text style={styles.emptyTitle}>Aucun club pour le moment</Text>
          <Text style={styles.emptyText}>Rejoins un club pour choisir les emails que tu reçois de sa part.</Text>
          <Button label="Explorer les clubs" onPress={() => router.navigate('/search')} style={{ marginTop: 20 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>Choisis les emails que tu reçois de chacun de tes clubs.</Text>
          {clubs.map((club) => (
            <View key={club.clubId} style={styles.card}>
              <Text style={styles.clubName}>{club.clubName}</Text>
              {ROWS.map((row) => (
                <View key={row.key} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowHint}>{row.hint}</Text>
                  </View>
                  <Switch
                    accessibilityLabel={`${row.label}, ${club.clubName}`}
                    value={club[row.key]}
                    onValueChange={(value) => toggle(club.clubId, row.key, value)}
                    trackColor={{ true: Colors.noir, false: Colors.grisClair }}
                    thumbColor={Colors.blanc}
                  />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grisClair,
    backgroundColor: Colors.blanc,
  },
  headerTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  intro: { fontSize: 15, fontFamily: Fonts.regular, color: Colors.grisTexte },
  card: {
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    padding: 16,
    gap: 16,
  },
  clubName: { fontSize: 16, fontFamily: Fonts.titre, color: Colors.noir },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontFamily: Fonts.medium, color: Colors.noir },
  rowHint: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.grisTexte, marginTop: 2 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir, textAlign: 'center' },
  emptyText: { marginTop: 8, color: Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular, textAlign: 'center' },
});
