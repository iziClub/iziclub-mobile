import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Type pour structurer l'état des inscriptions
export type InscriptionStatus = 'approved' | 'rejected' | 'pending_info' | 'submitted';

export default function InscriptionsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock de données
  const mockInscriptions = [
    { id: '1', clubName: 'Tennis Club Nancy', date: '14 Juin 2026', status: 'pending_info' as InscriptionStatus, statusLabel: "Attente d'infos", clubComment: "Le certificat médical fourni n'est pas daté de moins de 3 mois." },
    { id: '2', clubName: 'Metz Handball Association', date: '10 Juin 2026', status: 'submitted' as InscriptionStatus, statusLabel: 'En cours d\'examen', clubComment: '' },
    { id: '3', clubName: 'AS Nancy Lorraine Football', date: '01 Mai 2026', status: 'approved' as InscriptionStatus, statusLabel: 'Validé', clubComment: 'Bienvenue au club ! Ta carte de membre virtuelle est disponible.' },
    { id: '4', clubName: 'Yoga Zen Studio', date: '15 Avril 2026', status: 'rejected' as InscriptionStatus, statusLabel: 'Refusé', clubComment: 'Section complète pour cette saison. Remboursement en cours.' },
  ];

  const getStatusStyle = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return { bg: '#E8F5E9', text: '#2E7D32', icon: 'checkmark-circle' };
      case 'rejected': return { bg: '#FFEBEE', text: '#C62828', icon: 'close-circle' };
      case 'pending_info': return { bg: '#FFF3E0', text: '#EF6C00', icon: 'alert-circle' };
      default: return { bg: '#E8EAF6', text: '#3F51B5', icon: 'time' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/profile")}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes inscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {mockInscriptions.map((item) => {
          const ui = getStatusStyle(item.status);
          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => router.push({
                pathname: "/profile/inscription-detail",
                params: { id: item.id, clubName: item.clubName, status: item.status, date: item.date, comment: item.clubComment }
              })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.clubName}>{item.clubName}</Text>
                <Ionicons name="chevron-forward" size={18} color="#CCC" />
              </View>
              
              <Text style={styles.dateText}>Demande envoyée le {item.date}</Text>

              <View style={styles.footerRow}>
                <View style={[styles.statusBadge, { backgroundColor: ui.bg }]}>
                  <Ionicons name={ui.icon as any} size={14} color={ui.text} style={{ marginRight: 6 }} />
                  <Text style={[styles.statusText, { color: ui.text }]}>{item.statusLabel}</Text>
                </View>
                
                {/* Alerte textuelle rapide si action requise */}
                {item.status === 'pending_info' && (
                  <Text style={styles.actionRequiredText}>Action requise</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scrollContainer: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  clubName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', flex: 1, marginRight: 10 },
  dateText: { fontSize: 13, color: '#888', marginBottom: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  actionRequiredText: { fontSize: 12, fontWeight: '700', color: '#EF6C00' }
});