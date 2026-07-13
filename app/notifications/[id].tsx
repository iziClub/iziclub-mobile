import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '@/types/notification';
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

export default function MessageDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const [message, setMessage] = useState<Message | undefined>(undefined);
  // Trouver le message correspondant à l'ID reçu dans l'URL
  // const message = MOCK_MESSAGES.find(m => m.id === id);

  if (!message) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Message introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10 }}>
          <Text style={{ color: '#4A78FF' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await getNotificationsById(id, clubId); // Appel à ton service pour récupérer le message par ID
        setMessage(response.data);
      } catch (error) {
        console.error("Error fetching notification:", error);
      }
    };
    fetchMessage();
  }, [id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER ENTIÈREMENT PERSONNALISÉ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{message.clubName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{message.date}</Text>

        <View style={[styles.audienceBadge, message.isUrgent && styles.urgentBadge]}>
          <Ionicons 
            name={message.isUrgent ? "alert-circle" : "people-outline"} 
            size={12} 
            color={message.isUrgent ? "#E63946" : "#666"} 
            style={{ marginRight: 4 }} 
          />
          <Text style={[styles.audienceText, message.isUrgent && styles.urgentText]}>
            Destiné à : {message.sentTo}
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
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', maxWidth: '70%' },
  content: { padding: 24 },
  date: { fontSize: 12, color: '#999', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#F0F0F0', width: '100%', marginVertical: 16 },
  subject: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 16, lineHeight: 26 },
  bodyText: { fontSize: 15, color: '#333', lineHeight: 24, paddingBottom: 40 },
  audienceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  audienceText: { fontSize: 11, fontWeight: '500', color: '#555' },
  urgentBadge: { backgroundColor: '#FFF0F0' },
  urgentText: { color: '#E63946', fontWeight: '700' },
});

function getNotificationsById(id: string) {
  throw new Error('Function not implemented.');
}
