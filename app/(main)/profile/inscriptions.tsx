import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllSubmissions } from '@/services/forms.service';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

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
      case 'rejected': return { bg: Colors.rougeClair, text: Colors.rouge, icon: 'close-circle' };
      case 'needs_more_info': return { bg: Colors.grisClair, text: Colors.noir, icon: 'alert-circle' };
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
          <Icon name="arrow-back" size={24} color={Colors.noir} />
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
          <ActivityIndicator size="large" color={Colors.noir} />
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
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.clubName}>{item.clubName}</Text>
                    <Text style={{ color: Colors.grisTexte, fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 }}>{item.formName}</Text>
                  </View>
                  <Icon name="chevron-forward" size={18} color={Colors.gris} />
                </View>
                
                <Text style={styles.dateText}>Demande envoyée le {formatDate(item.submittedAt)} à {formatTime(item.submittedAt)}</Text>

                <View style={styles.footerRow}>
                  <View style={[styles.statusBadge, { backgroundColor: ui.bg }]}>
                    <Icon name={ui.icon as any} size={14} color={ui.text} style={{ marginRight: 8 }} />
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
              <Icon name="document-text-outline" size={48} color={Colors.gris} />
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
  headerTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  
  // 💡 Nouveaux styles pour les Filtres
  filterWrapper: { borderBottomWidth: 1, borderBottomColor: Colors.grisClair, paddingVertical: 12, backgroundColor: Colors.fond },
  filterScrollContainer: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.blanc, borderWidth: 1, borderColor: Colors.grisClair },
  filterChipActive: { backgroundColor: Colors.noir, borderColor: Colors.noir },
  filterText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.grisTexte },
  filterTextActive: { color: Colors.blanc, fontFamily: Fonts.medium },

  scrollContainer: { padding: 20 },
  card: { backgroundColor: Colors.blanc, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.grisClair, shadowColor: Colors.noir, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clubName: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir },
  dateText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, marginBottom: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  statusText: { fontSize: 12, fontFamily: Fonts.medium },
  actionRequiredText: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.rouge },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fond },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: Colors.grisTexte, marginTop: 12, fontSize: 14, fontFamily: Fonts.regular, textAlign: 'center' }
});