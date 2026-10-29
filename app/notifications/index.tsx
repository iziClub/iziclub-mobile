import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNotifications, markNotificationAsRead } from '@/services/notifications.service';
import { getClubById } from '@/services/clubs.service';
import { Message } from '@/types/notification';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function InboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['inbox_pinned', 'inbox_archived']).then(([p, a]) => {
      if (p[1]) setPinned(JSON.parse(p[1]));
      if (a[1]) setArchived(JSON.parse(a[1]));
    });
  }, []);

  const toggleId = (key: 'inbox_pinned' | 'inbox_archived', id: string) => {
    const setter = key === 'inbox_pinned' ? setPinned : setArchived;
    setter((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const visibleNotifications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications
      .filter((m) => archived.includes(String(m.id)) === showArchived)
      .filter((m) => !q || [m.title, m.content, m.clubName].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => Number(pinned.includes(String(b.id))) - Number(pinned.includes(String(a.id))));
  }, [notifications, search, archived, pinned, showArchived]);
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications();
      const rawNotifications: Message[] = response?.data || [];
      const clubNameCache = new Map<string, string>();
      const enrichedNotifications = await Promise.all(
        rawNotifications.map(async (msg) => {
          if (msg.clubId) {
            const cachedName = clubNameCache.get(msg.clubId);
            if (cachedName) {
              return { ...msg, clubName: cachedName };
            }

            try {
              const clubResponse = await getClubById(msg.clubId);
              const clubData = Array.isArray(clubResponse?.data)
                ? clubResponse.data[0]
                : (clubResponse?.data || clubResponse);
              const clubName = clubData?.name || msg.clubName || 'Club inconnu';
              clubNameCache.set(msg.clubId, clubName);
              return { ...msg, clubName };
            } catch (clubError) {
              console.error(`Erreur récupération club ${msg.clubId}:`, clubError);
              return { ...msg, clubName: msg.clubName || 'Club inconnu' };
            }
          }

          return msg;
        })
      );

      setNotifications(enrichedNotifications);
    }
    catch (error) {
      console.error("Error fetching notifications:", error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getAudienceLabel = (msg: Message) => {
    const categoryNames = (msg.categories || [])
      .map((category) => category?.name)
      .filter((name): name is string => !!name && name.trim().length > 0);
    if (categoryNames.length > 0) {
      return categoryNames.join(" • ");
    }

    return msg.sentTo || "Tout le monde";
  };

  const isMessageUnread = (msg: Message) => msg.isSeen === false || msg.isUnread === true;

  const handleOpenMessage = async (msg: Message) => {
    setNotifications(prev => prev.map(m => m.id === msg.id ? { ...m, isSeen: true, isUnread: false } : m));

    try {
      await markNotificationAsRead(msg.id);
    } catch (error) {
      console.error(`Erreur marquage notification ${msg.id} comme lue :`, error);
    }

    router.push(`../notifications/${msg.id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Boîte de réception</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchWrap}>
        <Input
          accessibilityLabel="Rechercher un message"
          size="l"
          placeholder="Rechercher un message"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          leading={<Icon name="search" size={22} color={Colors.grisTexte} />}
        />
        <Button
          variant="lien"
          label={showArchived ? 'Voir la boîte de réception' : `Archivés (${archived.length})`}
          onPress={() => setShowArchived((v) => !v)}
          style={styles.archiveToggle}
        />
      </View>

      {/* GESTION DE L'AFFICHAGE */}
      {loading ? (
        // 1. Écran de chargement
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.noir} />
        </View>
      ) : notifications.length === 0 ? (
        // 2. Écran liste vide (Empty State)
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="mail-open-outline" size={48} color={Colors.gris} />
          </View>
          <Text style={styles.emptyTitle}>Tout est propre !</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez reçu aucun message ou notification pour le moment.
          </Text>
          <Button label="Actualiser" variant="secondaire" icon="refresh" onPress={fetchNotifications} />
        </View>
      ) : (
        // 3. Liste des messages
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {visibleNotifications.map((msg) => {
            const unread = isMessageUnread(msg);
            const isPinned = pinned.includes(String(msg.id));
            const isArchived = archived.includes(String(msg.id));
            return (
              <Card
                key={msg.id}
                padding={16}
                style={[styles.msgCard, !unread && styles.msgCardRead]}
                onPress={() => handleOpenMessage(msg)}
              >
              <View style={styles.msgHeader}>
                <View style={styles.clubRow}>
                  <Text style={styles.clubName}>{msg.clubName}</Text>
                  {unread && <View style={styles.unreadBadge} />}
                </View>
                <Text style={styles.msgDate}>{msg.date}</Text>
              </View>

              <Text style={[styles.msgSubject, unread && styles.textBold]} numberOfLines={1}>
                {msg.title}
              </Text>

              <Text style={styles.msgPreview} numberOfLines={2}>
                {msg.content}
              </Text>

              <View style={styles.msgFooter}>
                <View style={[styles.audienceBadge, msg.isUrgent && styles.urgentBadge]}>
                  <Icon 
                    name={msg.isUrgent ? "alert-circle" : "people-outline"} 
                    size={12} 
                    color={msg.isUrgent ? Colors.rouge : Colors.grisTexte} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[styles.audienceText, msg.isUrgent && styles.urgentText]}>
                    {msg.isUrgent ? 'URGENT • ' : ''}{getAudienceLabel(msg)}
                  </Text>
                </View>
                <View style={styles.actionsRow}>
                  <IconButton
                    name="bookmark"
                    variant="fantome"
                    filled={isPinned}
                    color={isPinned ? Colors.noir : Colors.grisTexte}
                    accessibilityLabel={isPinned ? 'Désépingler' : 'Épingler'}
                    accessibilityState={{ selected: isPinned }}
                    onPress={() => toggleId('inbox_pinned', String(msg.id))}
                  />
                  <IconButton
                    name="download-outline"
                    variant="fantome"
                    color={Colors.grisTexte}
                    accessibilityLabel={isArchived ? 'Désarchiver' : 'Archiver'}
                    onPress={() => toggleId('inbox_archived', String(msg.id))}
                  />
                </View>
              </View>
            </Card>
          )})}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, backgroundColor: Colors.blanc },
  headerTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  listContainer: { padding: 20 },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, backgroundColor: Colors.fond },
  emptyIconContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.blanc, borderWidth: 1, borderColor: Colors.grisClair, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  // Cartes de messages
  msgCard: { marginBottom: 16 },
  msgCardRead: { opacity: 0.65 },
  searchWrap: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  archiveToggle: { alignSelf: 'flex-start' },
  actionsRow: { flexDirection: 'row', gap: 4 },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clubName: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.grisTexte },
  unreadBadge: { width: 8, height: 8, borderRadius: 8, backgroundColor: Colors.bleu },
  msgDate: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte },
  msgSubject: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir, marginBottom: 8 },
  textBold: { fontFamily: Fonts.medium, color: Colors.noir },
  msgPreview: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, lineHeight: 18, marginBottom: 12 },
  msgFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Badges d'audience
  audienceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.fond, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  audienceText: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.grisTexte },
  urgentBadge: { backgroundColor: Colors.rougeClair },
  urgentText: { color: Colors.rouge, fontFamily: Fonts.medium },
});