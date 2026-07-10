import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllSubmissions } from '@/services/forms.service';

export type InscriptionStatus = 'approved' | 'rejected' | 'pending_info' | 'submitted' | 'draft';

export default function InscriptionsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loader UX

  // 💡 Remplacement de useEffect par useFocusEffect pour re-déclencher à chaque focus de la page
  useFocusEffect(
    useCallback(() => {
      const fetchSubmissions = async () => {
        try {
          setLoading(true);
          const submissions = await getAllSubmissions();
          setInscriptions(submissions.data.submissions || []);
        } catch (error) {
          console.error("Erreur lors de la récupération des inscriptions :", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubmissions();
    }, [])
  );

  const formatDate = (dateString: string | number) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString: string | number) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return { bg: '#E8F5E9', text: '#2E7D32', icon: 'checkmark-circle' };
      case 'rejected': return { bg: '#FFEBEE', text: '#C62828', icon: 'close-circle' };
      case 'pending_info': return { bg: '#FFF3E0', text: '#EF6C00', icon: 'alert-circle' };
      default: return { bg: '#E8EAF6', text: '#3F51B5', icon: 'time' };
    }
  };

  return (
    <View style={[styles.container]}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/profile")}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes inscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4A78FF" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {inscriptions.map((item) => {
            const ui = getStatusStyle(item.status);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => router.push({
                  pathname: "/profile/inscription-detail",
                  params: { 
                    id: item.id, 
                    clubName: item.clubName, 
                    status: item.status, 
                    date: item.submittedAt, // Formaté directement pour la bannière du détail
                    comment: item.requestedInfo, 
                    formId: item.formId,
                    formName: item.formName,
                    // 💡 Ajout crucial pour ton écran détail : on sérialise le tableau en string
                    answers: JSON.stringify(item.answers || []) 
                  }
                })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.clubName}>{item.clubName}</Text>
                  <Text style={{ color: '#888', fontSize: 12 }}>{item.formName}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </View>
                
                <Text style={styles.dateText}>Demande envoyée le {formatDate(item.submittedAt)} à {formatTime(item.submittedAt)}</Text>

                <View style={styles.footerRow}>
                  <View style={[styles.statusBadge, { backgroundColor: ui.bg }]}>
                    <Ionicons name={ui.icon as any} size={14} color={ui.text} style={{ marginRight: 6 }} />
                    <Text style={[styles.statusText, { color: ui.text }]}>{item.status}</Text>
                  </View>
                  
                  {item.status === 'pending_info' && (
                    <Text style={styles.actionRequiredText}>Action requise</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {inscriptions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Aucune inscription enregistrée.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  actionRequiredText: { fontSize: 12, fontWeight: '700', color: '#EF6C00' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 14 }
});