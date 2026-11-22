import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { getMemberClubs } from '@/services/clubs.service';
import { getEventsByClubId } from '@/services/events.service';
import { ClubApi } from '@/types/club';
import { Event } from '@/types/event';

type FeedItem = { event: Event; club: ClubApi };

async function getClubEvents(club: ClubApi): Promise<FeedItem[]> {
  const items: FeedItem[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getEventsByClubId(club.id, { page, limit: 100 });
    items.push(...response.data
      .filter(event => event.isPublished !== false && !event.isArchived)
      .map(event => ({ event, club })));
    totalPages = response.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return items;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function ClubFeed({ user }: { user: unknown }) {
  const [clubs, setClubs] = useState<ClubApi[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;

    const loadFeed = async () => {
      setLoading(true);
      setError(false);
      setClubs([]);
      setItems([]);
      try {
        const response = await getMemberClubs();
        const memberClubs = response.data ?? [];
        const results = await Promise.allSettled(memberClubs.map(getClubEvents));
        if (!active) return;
        setClubs(memberClubs);
        setError(results.some(result => result.status === 'rejected'));
        const events = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
        events.sort((first, second) =>
          (Date.parse(second.event.createdAt) || 0) - (Date.parse(first.event.createdAt) || 0)
        );
        setItems(events.slice(0, 10));
      } catch (err) {
        console.error('Erreur chargement actualités des clubs :', err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFeed();
    return () => { active = false; };
  }, [user, refresh]));

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Actualités de mes clubs</Text>
        <Button variant="lien" label="Mes clubs" onPress={() => router.navigate('/profile/myClubs', { withAnchor: true })} />
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} color={Colors.noir} />
      ) : (
        <>
          {clubs.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clubs}>
              {clubs.map(club => (
                <Pressable key={club.id} accessibilityRole="button" style={styles.club} onPress={() => router.navigate({ pathname: '/search/club/[id]', params: { id: club.id } })}>
                  {club.profile?.profileImagePath ? (
                    <Image source={{ uri: club.profile.profileImagePath }} style={styles.clubImage} />
                  ) : (
                    <View style={styles.clubPlaceholder}><Icon name="people-outline" size={20} color={Colors.bleu} /></View>
                  )}
                  <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {error && (
            <View style={styles.message}>
              <Text style={styles.messageText}>Certaines actualités n’ont pas pu être chargées.</Text>
              <Button variant="lien" label="Réessayer" onPress={() => setRefresh(value => value + 1)} />
            </View>
          )}
          {!error && clubs.length === 0 && (
            <View style={styles.message}>
              <Text style={styles.messageText}>Rejoins un club pour retrouver ses actualités ici.</Text>
              <Button variant="lien" label="Explorer les clubs" onPress={() => router.navigate('/search')} />
            </View>
          )}
          {!error && clubs.length > 0 && items.length === 0 && (
            <Text style={styles.empty}>Aucune actualité de tes clubs pour le moment.</Text>
          )}
          {items.map(({ event, club }) => (
            <Pressable key={`${club.id}-${event.id}`} accessibilityRole="button" style={styles.event} onPress={() => router.navigate({ pathname: '/search/event/[id]', params: { id: event.id } })}>
              <View style={styles.eventIcon}><Icon name="calendar-outline" size={22} color={Colors.bleu} /></View>
              <View style={styles.eventContent}>
                <Text style={styles.eventClub}>{club.name}</Text>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <Text style={styles.eventMeta}>
                  {[formatDate(event.eventDate || event.startDate), event.address?.city].filter(Boolean).join(' · ') || 'Événement du club'}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.gris} />
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12 },
  title: { flexShrink: 1, fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  loading: { marginTop: 24 },
  clubs: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 12 },
  club: { width: 88, alignItems: 'center' },
  clubImage: { width: 52, height: 52, borderRadius: 26 },
  clubPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.bleuClair, alignItems: 'center', justifyContent: 'center' },
  clubName: { width: '100%', marginTop: 6, textAlign: 'center', fontSize: 12, fontFamily: Fonts.medium, color: Colors.noir },
  message: { marginHorizontal: 20, marginTop: 20, alignItems: 'flex-start', gap: 10 },
  messageText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte },
  empty: { marginHorizontal: 20, marginTop: 16, fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte },
  event: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.grisClair, gap: 12 },
  eventIcon: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bleuClair },
  eventContent: { flex: 1, gap: 3 },
  eventClub: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.bleu },
  eventTitle: { fontSize: 15, fontFamily: Fonts.medium, color: Colors.noir },
  eventMeta: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte },
});