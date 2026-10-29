import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import GravatarImage from "@/components/profile/GravatarImage";
import { getCurrentUser } from "@/services/auth";

import { useFocusEffect } from 'expo-router';

import { getLikedEvents, getParticipatingEvents } from '@/services/events.service'; 
import { getLikedClubs, getSavedClubs, getMemberClubs } from '@/services/clubs.service';
import { getAllSubmissions } from '@/services/forms.service';
import { getNotifications } from '@/services/notifications.service';
import { Colors } from '@/constants/colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ title: string, type: 'qr' | 'doc' } | null>(null);
  const [unreadMessagesCount] = useState(3);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  // const [userInfo, setUserInfo] = useState<any>(null);
  
  // 💡 Nouveaux states pour les compteurs dynamiques
  const [stats, setStats] = useState({
    likedCount: 0,
    clubsCount: 0,
    affiliatedClubsCount: 0,
    participationsCount: 0, // Tu peux le lier à ton API d'inscriptions ou d'événements à venir
    dossiersCount: 0,
    notificationsCount: 0,
  });

  // 💡 useFocusEffect s'exécute à CHAQUE FOIS que l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      const fetchProfileData = async () => {
        try {
          const [userResponse, likedEventsRes, likedClubsRes, savedClubsRes, memberClubsRes, participationsRes, dossierRes, notificationRes] = await Promise.all([
            getCurrentUser(),
            getLikedEvents().catch(() => ({ data: [] })),
            getLikedClubs().catch(() => ({ data: [] })),
            getSavedClubs().catch(() => ({ data: [] })),
            getMemberClubs().catch(() => ({ data: [] })),
            getParticipatingEvents().catch(() => ({ data: [] })), // Si tu as une API pour les participations
            getAllSubmissions().catch(() => ({ data: { submissions: [] } })), // Pour compter les dossiers
            getNotifications().catch(() => ({ data: [] })) // Pour compter les notifications non lues
          ]);

          setUserInfo(userResponse);

          const totalLikes = (likedEventsRes?.data?.length || 0) + (likedClubsRes?.data?.length || 0);
          const totalSavedClubs = savedClubsRes?.data?.length || 0;
          const totalAffiliatedClubs = memberClubsRes?.data?.length || 0;
          const totalParticipations = participationsRes?.data?.length || 0;
          const totalDossiers = dossierRes?.data?.submissions?.length || 0;
          const totalUnreadNotifications = notificationRes?.data?.filter((n: any) => n.isSeen === false || n.isUnread === true).length || 0;
          setStats(prev => ({
            ...prev,
            likedCount: totalLikes,
            clubsCount: totalSavedClubs,
            affiliatedClubsCount: totalAffiliatedClubs,
            participationsCount: totalParticipations,
            dossiersCount: totalDossiers,
            notificationsCount: totalUnreadNotifications
          }));

        } catch (error) {
          console.error("Erreur lors du rafraîchissement du profil :", error);
        }
      };

      fetchProfileData();
    }, [])
  );

  const openDoc = (title: string, type: 'qr' | 'doc') => {
    setSelectedDoc({ title, type });
    setModalVisible(true);
  };

  const [myDocuments, setMyDocuments] = useState([
    { id: '1', title: 'Pass Annuel - Tennis Club Nancy', type: 'doc' },
    { id: '2', title: 'Ma carte de membre virtuelle', type: 'qr' },
  ]);

  const deleteDocument = (id: string) => {
    Alert.alert(
      "Supprimer le document",
      "Êtes-vous sûr de vouloir supprimer ce document ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setMyDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
          }
        }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert("Désolé, nous avons besoin des permissions pour la caméra !");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newDoc = {
        id: Date.now().toString(),
        title: `Photo - ${new Date().toLocaleDateString()}`,
        type: 'doc' as const,
      };
      setMyDocuments([newDoc, ...myDocuments]);
      bottomSheetRef.current?.close();
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const newDoc = {
        id: Date.now().toString(),
        title: result.assets[0].name,
        type: 'doc' as const,
      };
      setMyDocuments([newDoc, ...myDocuments]);
      bottomSheetRef.current?.close();
    }
  };

  // Grille incluant désormais la boîte de réception à la place idéale
  type SavedCategoryPath = "/notifications" | "/(main)/profile/likedItems" | "/(main)/profile/savedItems" | "/(main)/profile/myClubs" | "/(main)/profile/upcomingEvents";
  type SavedCategory = {
    id: string;
    title: string;
    icon: string;
    color: string;
    path: SavedCategoryPath;
    badge?: number;
  };

  const savedCategories: SavedCategory[] = [
    {
      id: 'messages',
      title: 'Boîte de réception',
      icon: 'mail-unread',
      color: Colors.bleu,
      path: "/notifications",
      badge: stats.notificationsCount
    },
    {
      id: '1',
      title: 'Elements likés',
      icon: 'heart',
      color: Colors.rouge,
      path: "/(main)/profile/likedItems"
    },
    { id: '2', title: 'Clubs enregistrés', icon: 'bookmark', color: Colors.vert, path: "/(main)/profile/savedItems" },
    { id: '4', title: 'Mes clubs', icon: 'people', color: Colors.bleu, path: "/(main)/profile/myClubs", badge: stats.affiliatedClubsCount > 0 ? stats.affiliatedClubsCount : undefined },
    { id: '3', title: 'Mes participations', icon: 'calendar', color: Colors.rouge, path: "/(main)/profile/upcomingEvents" },
  ];
  // --- GUEST VIEW ---
  if (!user) {
    const guestFeatures = [
      { icon: 'heart', color: Colors.rouge, label: 'Retrouve tes clubs et événements favoris' },
      { icon: 'bookmark', color: Colors.vert, label: 'Enregistre les clubs qui t’intéressent' },
      { icon: 'document-text', color: Colors.bleu, label: 'Gère tes dossiers d’adhésion et tes pass' },
      { icon: 'notifications', color: Colors.rouge, label: 'Reçois les notifications de tes clubs' },
    ] as const;

    return (
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.noir, '#2A252A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.guestHero}
        >
          <View style={styles.guestIconCircle}>
            <Ionicons name="person" size={48} color={Colors.bleu} />
          </View>
          <Text style={styles.guestTitle}>Rejoins l'aventure !</Text>
          <Text style={styles.guestSubtitle}>
            Connecte-toi pour profiter de toutes les fonctionnalités d'iziClub.
          </Text>
        </LinearGradient>

        <View style={styles.guestFeatureList}>
          {guestFeatures.map((feature) => (
            <View key={feature.label} style={styles.guestFeatureRow}>
              <View style={[styles.guestFeatureIcon, { backgroundColor: `${feature.color}1A` }]}>
                <Ionicons name={feature.icon as any} size={20} color={feature.color} />
              </View>
              <Text style={styles.guestFeatureLabel}>{feature.label}</Text>
              <Ionicons name="lock-closed" size={16} color={Colors.gris} />
            </View>
          ))}
        </View>

        <View style={styles.guestActions}>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")} activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/(auth)/register")} activeOpacity={0.85}>
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top - 20 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* 1. HEADER PROFIL */}
        <View style={styles.header}>
          <GravatarImage email={user.user.email} size={90} style={styles.avatar} />
          <Text style={styles.userName}>{userInfo?.firstName} {userInfo?.lastName}</Text>
          <Text style={styles.userLevel}>Membre depuis Janvier 2024</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.likedCount}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.clubsCount}</Text>
              <Text style={styles.statLabel}>Clubs suivis</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.participationsCount}</Text>
              <Text style={styles.statLabel}>Sorties</Text>
            </View>
          </View>
        </View>

        {/* 2. GRILLE PRINCIPALE (Avec Boîte de réception) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Espace personnel & Suivis</Text>
          <View style={styles.gridContainer}>
            {savedCategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.gridCard} onPress={() => router.push({ pathname: cat.path })}>
                <View style={[styles.iconCircle, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={styles.gridCardTitle}>{cat.title}</Text>

                {/* Badge rouge dynamique si présent */}
                {cat.badge && cat.badge > 0 ? (
                  <View style={styles.gridBadge}>
                    <Text style={styles.gridBadgeText}>{cat.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. SECTION : MES INSCRIPTIONS (Ligne élégante isolée) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes inscriptions</Text>
          <TouchableOpacity
            style={styles.inscriptionsCard}
            onPress={() => router.push("/profile/inscriptions")}
          >
            <View style={styles.inscriptionsLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.bleuClair, marginBottom: 0 }]}>
                <Ionicons name="document-text-outline" size={22} color={Colors.bleu} />
              </View>
              <View style={styles.inscriptionsTextContainer}>
                <Text style={styles.inscriptionsCardTitle}>Suivre mes dossiers</Text>
                <Text style={styles.inscriptionsCardSubtitle}>Voir l'état de mes demandes d'adhésion</Text>
              </View>
            </View>
            <View style={styles.badgeAlert}>
              <Text style={styles.badgeAlertText}>{stats.dossiersCount}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.gris} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. DÉCONNEXION */}
        <View style={styles.navigationMenu}>
          <Text style={styles.navHeader}>Compte & Sécurité</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <View style={styles.navButtonContent}>
              <Ionicons name="log-out-outline" size={20} color={Colors.rouge} />
              <Text style={[styles.navButtonText, { color: Colors.rouge }]}>Déconnexion</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DOCUMENT PREVIEW */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDoc?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.noir} />
              </TouchableOpacity>
            </View>
            {selectedDoc?.type === 'qr' ? (
              <View style={styles.qrContainer}>
                <Ionicons name="qr-code" size={200} color={Colors.noir} />
                <Text style={styles.qrInstructions}>Présentez ce code à l'accueil du club</Text>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <Ionicons name="document-text" size={80} color={Colors.bleu} />
                <Text style={styles.docInfo}>Certificat n°88291-TC</Text>
                <Text style={styles.docDate}>Valide jusqu'au 01/01/2027</Text>
              </View>
            )}
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color={Colors.blanc} />
              <Text style={styles.downloadText}>Télécharger le PDF</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* BOTTOM SHEET IMPORT */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: Colors.grisClair, width: 40 }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.uploadTitle}>Ajouter un document</Text>
          <Text style={styles.uploadSubtitle}>Choisissez une méthode pour importer votre justificatif.</Text>
          <View style={styles.uploadOptionsRow}>
            <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
              <View style={[styles.optionIconCircle, { backgroundColor: Colors.vertClair }]}>
                <Ionicons name="camera" size={30} color={Colors.vert} />
              </View>
              <Text style={styles.optionText}>Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
              <View style={[styles.optionIconCircle, { backgroundColor: Colors.bleuClair }]}>
                <Ionicons name="document" size={30} color={Colors.bleu} />
              </View>
              <Text style={styles.optionText}>Fichier PDF</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  inscriptionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.blanc,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  inscriptionsLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  inscriptionsTextContainer: { marginLeft: 12, flex: 1 },
  inscriptionsCardTitle: { fontSize: 15, fontWeight: '600', color: Colors.noir },
  inscriptionsCardSubtitle: { fontSize: 12, color: Colors.gris, marginTop: 2 },
  badgeAlert: { flexDirection: 'row', alignItems: 'center' },
  badgeAlertText: { backgroundColor: Colors.rouge, color: Colors.blanc, fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.blanc,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.blanc,
    marginBottom: 12,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: Colors.noir },
  userLevel: { fontSize: 13, color: Colors.gris, marginTop: 2 },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
    justifyContent: 'space-between',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: Colors.noir },
  statLabel: { fontSize: 11, color: Colors.gris, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 20, backgroundColor: Colors.grisClair },

  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.noir,
    marginBottom: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: Colors.blanc,
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.noir,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  gridBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.rouge,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadgeText: {
    color: Colors.blanc,
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridCardTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', color: Colors.noir },

  navigationMenu: { marginTop: 30, paddingHorizontal: 20 },
  navHeader: { fontSize: 11, fontWeight: '700', color: Colors.gris, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  navButtonContent: { flexDirection: 'row', alignItems: 'center' },
  navButtonText: { marginLeft: 12, fontWeight: '500', color: Colors.noir },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 19, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.blanc,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.noir },
  qrContainer: { alignItems: 'center', padding: 20 },
  qrInstructions: { marginTop: 15, color: Colors.gris, fontSize: 14 },
  docPlaceholder: { alignItems: 'center', padding: 30 },
  docInfo: { marginTop: 15, fontSize: 16, fontWeight: '600', color: Colors.noir },
  docDate: { color: Colors.gris, fontSize: 13, marginTop: 5 },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: Colors.bleu,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 999,
    marginTop: 20,
    alignItems: 'center',
  },
  downloadText: { color: Colors.blanc, fontWeight: 'bold', marginLeft: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bleuClair,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addButtonText: {
    color: Colors.bleu,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.blanc,
  },
  uploadTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.noir },
  uploadSubtitle: {
    fontSize: 14,
    color: Colors.gris,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    paddingHorizontal: 20
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  uploadOption: { alignItems: 'center', width: '40%' },
  optionIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: { fontSize: 14, fontWeight: '600', color: Colors.noir },
  docContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    marginBottom: 10,
    paddingRight: 10,
  },
  docRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  docText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.noir,
    fontWeight: '500',
    flex: 1
  },
  deleteIconButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestHero: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  guestIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.blanc,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.blanc, marginBottom: 8, textAlign: 'center' },
  guestSubtitle: { fontSize: 15, color: Colors.grisClair, textAlign: 'center', lineHeight: 21 },
  guestFeatureList: {
    marginTop: -20,
    marginHorizontal: 20,
    backgroundColor: Colors.blanc,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: Colors.noir,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  guestFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grisClair,
    gap: 12,
  },
  guestFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestFeatureLabel: { flex: 1, fontSize: 14, color: Colors.noir, fontWeight: '500' },
  guestActions: { paddingHorizontal: 30, marginTop: 28 },
  loginButton: { backgroundColor: Colors.noir, width: '100%', padding: 18, borderRadius: 999, alignItems: 'center', marginBottom: 12 },
  loginButtonText: { color: Colors.blanc, fontWeight: 'bold', fontSize: 16 },
  registerButton: { backgroundColor: Colors.blanc, borderWidth: 1.5, borderColor: Colors.noir, width: '100%', padding: 18, borderRadius: 999, alignItems: 'center' },
  registerButtonText: { color: Colors.noir, fontWeight: 'bold', fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, marginTop: 10 },
});