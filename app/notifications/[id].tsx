import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '@/types/notification';
import { getNotificationById, markNotificationAsRead } from '@/services/notifications.service';
import { getClubById } from '@/services/clubs.service';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
// On réutilise le même type (Idéalement à exporter depuis un fichier types.ts)

// Mock data (Copie conforme de ton index pour la démo)
// const MOCK_MESSAGES: Message[] = [
//   {
//     id: '1',
//     clubName: 'Nancy Tennis Club',
//     sentTo: 'Section Tennis Adulte - Jeudi',
//     subject: 'Report du cours de ce soir (Intempéries)',
//     body: "Bonjour à tous,\n\nEn raison des fortes pluies et des risques d'inondation sur les terrains extérieurs, le cours de ce soir est malheureusement annulé et reporté à vendredi prochain aux mêmes horaires.\n\nMerci de votre compréhension.\nLe secrétariat.",
//     date: "Aujourd'hui, 14:22",
//     isUnread: false,
//     isUrgent: true,
//   },
//   {
//     id: '2',
//     clubName: 'Nancy Tennis Club',
//     audience: 'Tout le club',
//     subject: "Inscriptions ouvertes pour les stages d'été ☀️",
//     body: "Chers adhérents,\n\nLes inscriptions pour nos traditionnels stages d'été (Juillet et Août) sont désormais officiellement ouvertes en ligne ! Places limitées à 15 participants par session.\n\nTarif préférentiel pour les membres actuels du club.",
//     date: 'Hier, 10:15',
//     isUnread: false,
//   },
//   {
//     id: '3',
//     clubName: 'Metz Handball Association',
//     audience: 'Équipe U18 Masculine',
//     subject: 'Changement de lieu pour le match de samedi',
//     body: "Salut l'équipe,\n\nLe match contre Thionville de ce samedi ne se jouera pas au gymnase habituel mais au Complexe Sportif Saint-Symphorien. Rendez-vous sur place à 13h30 pétantes pour l'échauffement.",
//     date: '24 Juin 2026',
//     isUnread: false,
//   }
// ];

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "Date non disponible";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(':', 'h');

  return `${formattedDate} à ${formattedTime}`;
};

export default function MessageDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, clubId } = useLocalSearchParams<{ id: string; clubId?: string }>();
  const [message, setMessage] = useState<Message | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchMessage = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getNotificationById(id); // Appel à ton service pour récupérer le message par ID
      let notificationData = response.data;
      if (notificationData?.clubId) {
        try {
          const clubResponse = await getClubById(notificationData.clubId);
          const clubData = Array.isArray(clubResponse?.data)
            ? clubResponse.data[0]
            : (clubResponse?.data || clubResponse);
          notificationData = {
            ...notificationData,
            clubName: clubData?.name || notificationData.clubName || 'Club inconnu',
          };
        } catch (clubError) {
          console.error(`Erreur récupération club ${notificationData.clubId}:`, clubError);
        }
      }
      setMessage(notificationData);

      if (notificationData.isSeen === false || notificationData.isUnread === true) {
        try {
          await markNotificationAsRead(id);
          setMessage(prev => prev ? { ...prev, isSeen: true, isUnread: false } : prev);
        } catch (markError) {
          console.error(`Erreur marquage notification ${id} comme lue :`, markError);
        }
      }
    } catch (error) {
      console.error("Error fetching notification:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessage();
    }, [id])
  );

  const getAudienceLabel = (msg: Message) => {
    const categoryNames = (msg.categories || [])
      .map((category) => category?.name)
      .filter((name): name is string => !!name && name.trim().length > 0);
    if (categoryNames.length > 0) {
      return categoryNames.join(" • ");
    }

    return msg.sentTo || "Toutes les catégories";
  };

  if (!message && !loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.noir }}>Message introuvable</Text>
        <Button variant="lien" label="Retour" onPress={() => router.back()} style={{ marginTop: 12 }} />
      </View>
    );
  }

  if (!message) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.grisTexte }}>Chargement du message...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER ENTIÈREMENT PERSONNALISÉ */}
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle} numberOfLines={1}>{message.clubName}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{formatDate(message.createdAt ?? message.date)}</Text>

        <View style={[styles.audienceBadge, message.isUrgent && styles.urgentBadge]}>
          <Icon 
            name={message.isUrgent ? "alert-circle" : "people-outline"} 
            size={12} 
            color={message.isUrgent ? Colors.rouge : Colors.gris} 
            style={{ marginRight: 4 }} 
          />
          <Text style={[styles.audienceText, message.isUrgent && styles.urgentText]}>
            Destiné à : {getAudienceLabel(message)}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subject}>{message.title}</Text>
        <Text style={styles.bodyText}>{message.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: Colors.grisClair, backgroundColor: Colors.blanc },
  headerTitle: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir, maxWidth: '70%' },
  content: { padding: 24 },
  date: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, marginBottom: 8 },
  divider: { height: 1, backgroundColor: Colors.grisClair, width: '100%', marginVertical: 16 },
  subject: { fontSize: 20, fontFamily: Fonts.titre, color: Colors.noir, marginBottom: 16, lineHeight: 26 },
  bodyText: { fontSize: 16, fontFamily: Fonts.regular, color: Colors.noir, lineHeight: 24, paddingBottom: 40 },
  audienceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blanc, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.grisClair },
  audienceText: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.grisTexte },
  urgentBadge: { backgroundColor: Colors.rougeClair, borderColor: Colors.rouge },
  urgentText: { color: Colors.rouge, fontFamily: Fonts.medium },
});
