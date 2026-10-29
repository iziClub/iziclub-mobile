import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNotifications, markNotificationAsRead } from '@/services/notifications.service';
import { getClubById } from '@/services/clubs.service';
import { Message } from '@/types/notification';
import { Colors } from '@/constants/colors';

export default function InboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Message[]>([]);

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

    return msg.sentTo || "Toutes les catégories";
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.noir} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boîte de réception</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* GESTION DE L'AFFICHAGE */}
      {loading ? (
        // 1. Écran de chargement
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.bleu} />
        </View>
      ) : notifications.length === 0 ? (
        // 2. Écran liste vide (Empty State)
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="mail-open-outline" size={48} color={Colors.gris} />
          </View>
          <Text style={styles.emptyTitle}>Tout est propre !</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez reçu aucun message ou notification pour le moment.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchNotifications}>
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 3. Liste des messages
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {notifications.map((msg) => {
            const unread = isMessageUnread(msg);
            return (
              <TouchableOpacity 
                key={msg.id} 
                style={[styles.msgCard, unread && styles.msgCardUnread]}
                onPress={() => handleOpenMessage(msg)}
                activeOpacity={0.7}
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
                  <Ionicons 
                    name={msg.isUrgent ? "alert-circle" : "people-outline"} 
                    size={12} 
                    color={msg.isUrgent ? Colors.rouge : Colors.gris} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[styles.audienceText, msg.isUrgent && styles.urgentText]}>
                    {msg.isUrgent ? 'URGENT • ' : ''}{getAudienceLabel(msg)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )})}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: Colors.grisClair, backgroundColor: Colors.blanc },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.noir },
  listContainer: { padding: 20 },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, backgroundColor: Colors.fond },
  emptyIconContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.blanc, borderWidth: 1, borderColor: Colors.grisClair, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.noir, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: Colors.gris, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  refreshButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.blanc, borderWidth: 1, borderColor: Colors.grisClair },
  refreshButtonText: { fontSize: 14, fontWeight: '600', color: Colors.noir },

  // Cartes de messages
  msgCard: { backgroundColor: Colors.blanc, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.grisClair, shadowColor: Colors.noir, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  msgCardUnread: { backgroundColor: Colors.blanc, borderColor: Colors.bleu, borderWidth: 1.5 },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clubName: { fontSize: 13, fontWeight: '600', color: Colors.gris },
  unreadBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.bleu },
  msgDate: { fontSize: 11, color: Colors.gris },
  msgSubject: { fontSize: 15, fontWeight: '600', color: Colors.noir, marginBottom: 6 },
  textBold: { fontWeight: '700', color: Colors.noir },
  msgPreview: { fontSize: 13, color: Colors.gris, lineHeight: 18, marginBottom: 12 },
  msgFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Badges d'audience
  audienceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.fond, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  audienceText: { fontSize: 11, fontWeight: '500', color: Colors.gris },
  urgentBadge: { backgroundColor: '#FCE8E9' },
  urgentText: { color: Colors.rouge, fontWeight: '700' },
});