import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllSubmissions } from '@/services/forms.service';
import { Colors } from '@/constants/colors';

export type InscriptionStatus = 'approved' | 'rejected' | 'needs_more_info' | 'submitted' | 'draft';
// Type pour notre filtre de sélection ('all' inclus pour tout afficher)
type FilterStatus = 'all' | InscriptionStatus;

export default function InscriptionsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 💡 État pour gérer le filtre sélectionné
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

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

  // 💡 Liste des onglets de filtres avec leurs labels en français
  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'submitted', label: 'En attente' },
    { key: 'needs_more_info', label: 'Info requise' },
    { key: 'approved', label: 'Acceptées' },
    { key: 'rejected', label: 'Refusées' },
  ];

  // 💡 Filtrage des inscriptions en mémoire (performant)
  const filteredInscriptions = inscriptions.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.status === selectedFilter;
  });

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

  // Label propre pour l'affichage dans le badge
  const getStatusLabel = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'needs_more_info': return 'Info requise';
      case 'submitted': return 'En cours';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const getStatusStyle = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return { bg: Colors.vertClair, text: Colors.vert, icon: 'checkmark-circle' };
      case 'rejected': return { bg: '#FCE8E9', text: Colors.rouge, icon: 'close-circle' };
      case 'needs_more_info': return { bg: '#FFF3E0', text: '#D97706', icon: 'alert-circle' };
      case 'submitted': return { bg: Colors.bleuClair, text: Colors.bleu, icon: 'time' };
      case 'draft': return { bg: Colors.grisClair, text: Colors.noir, icon: 'document-text' };
      default: return { bg: Colors.bleuClair, text: Colors.bleu, icon: 'time' };
    }
  };

  return (
    <View style={[styles.container]}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.noir} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes inscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 💡 BARRE DE FILTRES (UI/UX Moderne & Défilable) */}
      {!loading && (
        <View style={styles.filterWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScrollContainer}
          >
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(tab.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.bleu} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {filteredInscriptions.map((item) => {
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
                    date: item.submittedAt, 
                    comment: item.requestedInfo, 
                    formId: item.formId,
                    formName: item.formName,
                    answers: JSON.stringify(item.answers || []) 
                  }
                })}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.clubName}>{item.clubName}</Text>
                    <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{item.formName}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </View>
                
                <Text style={styles.dateText}>Demande envoyée le {formatDate(item.submittedAt)} à {formatTime(item.submittedAt)}</Text>

                <View style={styles.footerRow}>
                  <View style={[styles.statusBadge, { backgroundColor: ui.bg }]}>
                    <Ionicons name={ui.icon as any} size={14} color={ui.text} style={{ marginRight: 6 }} />
                    <Text style={[styles.statusText, { color: ui.text }]}>{getStatusLabel(item.status)}</Text>
                  </View>
                  
                  {item.status === 'pending_info' && (
                    <Text style={styles.actionRequiredText}>Action requise</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredInscriptions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Aucune inscription dans cette catégorie.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, backgroundColor: Colors.blanc, borderBottomWidth: 1, borderBottomColor: Colors.grisClair },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.noir },
  
  // 💡 Nouveaux styles pour les Filtres
  filterWrapper: { borderBottomWidth: 1, borderBottomColor: Colors.grisClair, paddingVertical: 12, backgroundColor: Colors.fond },
  filterScrollContainer: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.blanc, borderWidth: 1, borderColor: Colors.grisClair },
  filterChipActive: { backgroundColor: Colors.bleu, borderColor: Colors.bleu },
  filterText: { fontSize: 14, fontWeight: '500', color: Colors.gris },
  filterTextActive: { color: Colors.blanc, fontWeight: '600' },

  scrollContainer: { padding: 20 },
  card: { backgroundColor: Colors.blanc, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.grisClair, shadowColor: Colors.noir, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  clubName: { fontSize: 16, fontWeight: '600', color: Colors.noir },
  dateText: { fontSize: 13, color: Colors.gris, marginBottom: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '600' },
  actionRequiredText: { fontSize: 12, fontWeight: '700', color: Colors.rouge },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fond },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: Colors.gris, marginTop: 10, fontSize: 14, textAlign: 'center' }
});