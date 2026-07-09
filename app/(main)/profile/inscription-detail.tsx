import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InscriptionStatus } from './inscriptions';
import { getFormByFormId } from '@/services/forms.service';

export default function InscriptionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const clubName = (params.clubName as string) || "Club Partenaire";
  const status = params.status as InscriptionStatus;
  const date = params.date as string;
  const comment = params.comment as string;
  
  const formId = params.formId as string;
  const rawAnswers = params.answers ? JSON.parse(params.answers as string) : [];
  const submittedAt = date ? new Date(date) : null;

  const [formStructure, setFormStructure] = useState<any | null>(null);
  const [loadingForm, setLoadingForm] = useState<boolean>(true);

  useEffect(() => {
    const fetchFormStructure = async () => {
      if (!formId) {
        setLoadingForm(false);
        return;
      }
      try {
        const response = await getFormByFormId(formId);
        // 💡 Extraction propre selon la forme de ton API déduite des logs
        const formData = response?.data || response;
        setFormStructure(formData);
      } catch (error) {
        console.error("Erreur métadonnées formulaire:", error);
      } finally {
        setLoadingForm(false);
      }
    };

    fetchFormStructure();
  }, [formId]);

  const formatDate = (d: Date | null) => {
    if (!d || Number.isNaN(d.getTime())) return 'Date inconnue';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  const formatTime = (d: Date | null) => {
    if (!d || Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(d);
  };

  const getStatusConfig = (status: InscriptionStatus) => {
    switch (status) {
      case 'approved': return { color: '#10B981', bg: '#E6F4EA', label: 'Dossier Validé', icon: 'verified' };
      case 'rejected': return { color: '#EF4444', bg: '#FCE8E6', label: 'Dossier Refusé', icon: 'cancel' };
      case 'pending_info': return { color: '#F59E0B', bg: '#FEF3C7', label: 'Action requise', icon: 'error' };
      default: return { color: '#3B82F6', bg: '#EBF5FF', label: 'En cours d\'analyse', icon: 'hourglass-top' };
    }
  };

  const config = getStatusConfig(status);

  // 💡 Match parfait et sécurisé des intitulés de questions
  const getReadableAnswer = (questionId: string, value: any) => {
    const defaultTitle = "Question";
    
    if (!formStructure || !formStructure.questions) {
      return { title: defaultTitle, textValue: String(value) };
    }

    const question = formStructure.questions.find((q: any) => q.id === questionId);
    if (!question) return { title: "Question", textValue: String(value) };

    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { title: question.name, textValue: "Non renseigné" };
    }

    // Vos valeurs de logs montrent que l'API renvoie déjà le texte en clair ("Débutant")
    // Pas besoin de mapper les IDs d'options complexes si la string est directement fournie
    const textValue = Array.isArray(value) ? value.join(', ') : String(value);

    return { title: question.name, textValue };
  };

  return (
    <View style={[styles.container]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/profile/inscriptions")}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la demande</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* BANNIÈRE DE STATUT PREMIUM */}
        <View style={[styles.statusBanner, { backgroundColor: config.bg, borderColor: config.color + '20' }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF' }]}>
            <MaterialIcons name={config.icon as any} size={24} color={config.color} />
          </View>
          <View style={styles.statusBannerText}>
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.statusSubtitle}>
              Envoyé le {formatDate(submittedAt)} à {formatTime(submittedAt)}
            </Text>
          </View>
        </View>

        {/* MESSAGES ET RETOURS DU CLUB */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes de la structure</Text>
          {comment ? (
            <View style={styles.messageBubbleClub}>
              <View style={styles.clubMessageHeader}>
                <Text style={styles.clubMessageSender}>{clubName}</Text>
                <Text style={styles.clubMessageTime}>Dernier retour</Text>
              </View>
              <Text style={styles.clubMessageBody}>{comment}</Text>
              
              {status === 'pending_info' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.replace("/profile/inscriptions")}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Compléter mon dossier</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyMessageContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={24} color="#A3A3A3" />
              <Text style={styles.emptyMessageText}>Aucune remarque ou consigne particulière.</Text>
            </View>
          )}
        </View>

        {/* VOS RÉPONSES AU FORMULAIRE CARD COHÉRENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formulaire transmis</Text>
          {loadingForm ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : (
            <View style={styles.responsesCard}>
              {rawAnswers.map((ans: any, index: number) => {
                const mapped = getReadableAnswer(ans.questionId, ans.value);
                return (
                  <View 
                    key={ans.questionId} 
                    style={[
                      styles.responseRow, 
                      index === rawAnswers.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <Text style={styles.responseQuestion}>{mapped.title}</Text>
                    <Text style={styles.responseValue}>{mapped.textValue}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* RÉCAPITULATIF DES DONNÉES ENVOYÉES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de l'entité</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Club destinataire</Text>
              <Text style={styles.summaryValue}>{clubName}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Pièces administratives</Text>
              <View style={styles.fileBadge}>
                <Ionicons name="document-attach" size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                <Text style={styles.fileText}>Certificat_Medical.pdf</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    height: 60, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1, 
    borderColor: '#E5E5E5' 
  },
  backButton: { 
    width: 36, 
    height: 36, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 18, 
    backgroundColor: '#F5F5F5' 
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#171717', flex: 1, textAlign: 'center' },
  scrollContainer: { padding: 20 },
  
  statusBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 24 
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  statusBannerText: { marginLeft: 16, flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#737373', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  
  messageBubbleClub: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000', 
    shadowOpacity: 0.02, 
    shadowRadius: 6, 
    elevation: 1 
  },
  clubMessageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  clubMessageSender: { fontWeight: '700', color: '#171717', fontSize: 14 },
  clubMessageTime: { fontSize: 12, color: '#A3A3A3', fontWeight: '500' },
  clubMessageBody: { fontSize: 14, color: '#404040', lineHeight: 22 },
  
  actionButton: { 
    flexDirection: 'row', 
    backgroundColor: '#171717', 
    paddingVertical: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 14 
  },
  actionButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },

  emptyMessageContainer: { 
    flexDirection: 'row',
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E5E5E5' 
  },
  emptyMessageText: { fontSize: 13, color: '#737373', marginLeft: 12, flex: 1 },

  responsesCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 4,
    borderWidth: 1, 
    borderColor: '#E5E5E5',
    shadowColor: '#000', 
    shadowOpacity: 0.02, 
    shadowRadius: 6, 
    elevation: 1 
  },
  responseRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  responseQuestion: { fontSize: 13, fontWeight: '500', color: '#737373', marginBottom: 4 },
  responseValue: { fontSize: 14, fontWeight: '600', color: '#171717' },

  summaryCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    borderWidth: 1, 
    borderColor: '#E5E5E5' 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  summaryLabel: { color: '#737373', fontSize: 14, fontWeight: '500' },
  summaryValue: { fontWeight: '600', color: '#171717', fontSize: 14 },
  fileBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  fileText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  loaderContainer: { paddingVertical: 24, alignItems: 'center' }
});