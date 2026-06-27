import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InscriptionStatus } from './inscriptions';

export default function InscriptionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const clubName = params.clubName as string;
  const status = params.status as InscriptionStatus;
  const date = params.date as string;
  const comment = params.comment as string;

  // Configuration UI du statut
  const getStatusConfig = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return { color: '#2E7D32', label: 'Dossier Validé', icon: 'verified' };
      case 'rejected': return { color: '#C62828', label: 'Dossier Refusé', icon: 'cancel' };
      case 'pending_info': return { color: '#EF6C00', label: 'Informations manquantes', icon: 'error' };
      default: return { color: '#3F51B5', label: 'En cours d\'analyse', icon: 'hourglass-top' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/profile/inscriptions")}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Détail inscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* BANNIÈRE DE STATUT */}
        <View style={[styles.statusBanner, { backgroundColor: config.color + '10', borderColor: config.color + '30' }]}>
          <MaterialIcons name={config.icon as any} size={28} color={config.color} />
          <View style={styles.statusBannerText}>
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.statusSubtitle}>Soumis le {date}</Text>
          </View>
        </View>

        {/* MESSAGES ET RETOURS DU CLUB */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes et échanges avec le club</Text>
          {comment ? (
            <View style={styles.messageBubbleClub}>
              <View style={styles.clubMessageHeader}>
                <Text style={styles.clubMessageSender}>{clubName}</Text>
                <Text style={styles.clubMessageTime}>Récent</Text>
              </View>
              <Text style={styles.clubMessageBody}>{comment}</Text>
              
              {status === 'pending_info' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    // Logique pour modifier le formulaire ou renvoyer la pièce
                    router.replace("/profile/inscriptions"); 
                  }}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFF" />
                  <Text style={styles.actionButtonText}>Mettre à jour mes pièces</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyMessageContainer}>
              <Ionicons name="chatbubbles-outline" size={32} color="#CCC" />
              <Text style={styles.emptyMessageText}>Aucun message du club pour le moment.</Text>
            </View>
          )}
        </View>

        {/* RÉCAPITULATIF DES DONNÉES ENVOYÉES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif de ma demande</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Structure cible</Text>
              <Text style={styles.summaryValue}>{clubName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type d'adhésion</Text>
              <Text style={styles.summaryValue}>Nouvelle inscription</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pièces jointes</Text>
              <Text style={[styles.summaryValue, { color: '#4A78FF' }]}>Certificat_Medical.pdf</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1, textAlign: 'center' },
  scrollContainer: { padding: 20 },
  
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 25 },
  statusBannerText: { marginLeft: 14, flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12, color: '#999' },
  
  // Style Bulle Message Club
  messageBubbleClub: { backgroundColor: '#F3F4F6', borderRadius: 20, borderTopLeftRadius: 4, padding: 16, shadowColor: '#000', shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
  clubMessageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  clubMessageSender: { fontWeight: '700', color: '#0E011A', fontSize: 14 },
  clubMessageTime: { fontSize: 11, color: '#888' },
  clubMessageBody: { fontSize: 14, color: '#333', lineHeight: 20 },
  
  actionButton: { flexDirection: 'row', backgroundColor: '#0E011A', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 8 },

  emptyMessageContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  emptyMessageText: { fontSize: 13, color: '#999', marginTop: 8 },

  summaryCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  summaryLabel: { color: '#666', fontSize: 14 },
  summaryValue: { fontWeight: '600', color: '#1A1A1A', fontSize: 14 }
});