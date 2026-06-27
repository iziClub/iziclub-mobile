import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Message = {
  id: string;
  clubName: string;
  audience: string;
  subject: string;
  body: string;
  date: string;
  isUnread: boolean;
  isUrgent?: boolean;
};

export default function InboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Mock data réaliste
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      clubName: 'Nancy Tennis Club',
      audience: 'Section Tennis Adulte - Jeudi',
      subject: 'Report du cours de ce soir (Intempéries)',
      body: 'Bonjour à tous,\n\nEn raison des fortes pluies et des risques d\'inondation sur les terrains extérieurs, le cours de ce soir est malheureusement annulé et reporté à vendredi prochain aux mêmes horaires.\n\nMerci de votre compréhension.\nLe secrétariat.',
      date: 'Aujourd\'hui, 14:22',
      isUnread: true,
      isUrgent: true,
    },
    {
      id: '2',
      clubName: 'Nancy Tennis Club',
      audience: 'Tout le club',
      subject: 'Inscriptions ouvertes pour les stages d\'été ☀️',
      body: 'Chers adhérents,\n\nLes inscriptions pour nos traditionnels stages d\'été (Juillet et Août) sont désormais officiellement ouvertes en ligne ! Places limitées à 15 participants par session.\n\nTarif préférentiel pour les membres actuels du club.',
      date: 'Hier, 10:15',
      isUnread: true,
    },
    {
      id: '3',
      clubName: 'Metz Handball Association',
      audience: 'Équipe U18 Masculine',
      subject: 'Changement de lieu pour le match de samedi',
      body: 'Salut l\'équipe,\n\nLe match contre Thionville de ce samedi ne se jouera pas au gymnase habituel mais au Complexe Sportif Saint-Symphorien. Rendez-vous sur place à 13h30 pétantes pour l\'échauffement.',
      date: '24 Juin 2026',
      isUnread: false,
    }
  ]);

  const handleOpenMessage = (msg: Message) => {
  // Marquer comme lu localement
  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isUnread: false } : m));
  
  // Redirection vers le nouvel écran avec l'ID du message
  router.push(`../notifications/${msg.id}`); 
};

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boîte de réception</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* MESSAGES LIST */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <TouchableOpacity 
            key={msg.id} 
            style={[styles.msgCard, msg.isUnread && styles.msgCardUnread]}
            onPress={() => handleOpenMessage(msg)}
            activeOpacity={0.7}
          >
            <View style={styles.msgHeader}>
              <View style={styles.clubRow}>
                <Text style={styles.clubName}>{msg.clubName}</Text>
                {msg.isUnread && <View style={styles.unreadBadge} />}
              </View>
              <Text style={styles.msgDate}>{msg.date}</Text>
            </View>

            {/* Objet du message */}
            <Text style={[styles.msgSubject, msg.isUnread && styles.textBold]} numberOfLines={1}>
              {msg.subject}
            </Text>

            {/* Aperçu du contenu */}
            <Text style={styles.msgPreview} numberOfLines={2}>
              {msg.body}
            </Text>

            {/* Footer de la carte : Cible / Audience */}
            <View style={styles.msgFooter}>
              <View style={[styles.audienceBadge, msg.isUrgent && styles.urgentBadge]}>
                <Ionicons 
                  name={msg.isUrgent ? "alert-circle" : "people-outline"} 
                  size={12} 
                  color={msg.isUrgent ? "#E63946" : "#666"} 
                  style={{ marginRight: 4 }} 
                />
                <Text style={[styles.audienceText, msg.isUrgent && styles.urgentText]}>
                  {msg.isUrgent ? 'URGENT • ' : ''}{msg.audience}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  listContainer: { padding: 20 },
  
  // Cartes de messages
  msgCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#F2F2F2', shadowColor: '#000', shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
  msgCardUnread: { backgroundColor: '#F8F9FF', borderColor: '#4A78FF20' },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clubName: { fontSize: 13, fontWeight: '600', color: '#666' },
  unreadBadge: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4A78FF' },
  msgDate: { fontSize: 11, color: '#999' },
  msgSubject: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 6 },
  textBold: { fontWeight: '700', color: '#000' },
  msgPreview: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 12 },
  msgFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Badges d'audience
  audienceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  audienceText: { fontSize: 11, fontWeight: '500', color: '#555' },
  urgentBadge: { backgroundColor: '#FFF0F0' },
  urgentText: { color: '#E63946', fontWeight: '700' },

  // Design modal (Feuille coulissante depuis le bas)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%', maxHeight: '85%', alignItems: 'center' },
  modalDragHandle: { width: 40, height: 5, backgroundColor: '#E5E5E5', borderRadius: 2.5, marginBottom: 16 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  modalClubName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  closeModalButton: { padding: 4 },
  modalDate: { fontSize: 12, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0', width: '100%', marginVertical: 16 },
  modalSubject: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 14, lineHeight: 24 },
  modalBodyScroll: { maxHeight: 300, width: '100%' },
  modalBodyText: { fontSize: 14, color: '#333', lineHeight: 22, paddingBottom: 20 }
});