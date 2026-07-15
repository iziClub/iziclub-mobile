import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/context/AuthContext';
import GravatarImage from "@/components/profile/GravatarImage";
import { getCurrentUser } from "@/services/auth";

import { useFocusEffect } from 'expo-router';

import { getLikedEvents, getParticipatingEvents } from '@/services/events.service'; 
import { getLikedClubs, getSavedClubs, getMemberClubs } from '@/services/clubs.service';
import { getAllSubmissions } from '@/services/forms.service';
import { getNotifications } from '@/services/notifications.service';

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
  type SavedCategoryPath = "/notifications" | "/profile/likedItems" | "/profile/savedItems" | "/profile/myClubs" | "/profile/upcomingEvents";
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
      color: '#FFB900',
      path: "/notifications",
      badge: stats.notificationsCount // 💡 Badge dynamique basé sur le nombre de notifications non lues
    },
    {
      id: '1',
      title: 'Elements likés',
      icon: 'heart',
      color: '#FF5A5F',
      path: "/profile/likedItems"
    },
    { id: '2', title: 'Clubs enregistrés', icon: 'bookmark', color: '#4A78FF', path: "/profile/savedItems" },
    { id: '4', title: 'Mes clubs', icon: 'people', color: '#0CA789', path: "/profile/myClubs", badge: stats.affiliatedClubsCount > 0 ? stats.affiliatedClubsCount : undefined },
    { id: '3', title: 'Mes participations', icon: 'calendar', color: '#6D5AD3', path: "/profile/upcomingEvents" },
  ];
  // --- GUEST VIEW ---
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', paddingHorizontal: 30 }]}>
        <View style={styles.guestContent}>
          <View style={styles.guestIconCircle}>
            <Ionicons name="person-outline" size={60} color="#4A78FF" />
          </View>
          <Text style={styles.guestTitle}>Rejoins l'aventure !</Text>
          <Text style={styles.guestSubtitle}>
            Connecte-toi pour sauvegarder tes clubs favoris, gérer tes documents et accéder à tes pass.
          </Text>

          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLinkText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
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
              <View style={[styles.iconCircle, { backgroundColor: '#4A78FF15', marginBottom: 0 }]}>
                <Ionicons name="document-text-outline" size={22} color="#4A78FF" />
              </View>
              <View style={styles.inscriptionsTextContainer}>
                <Text style={styles.inscriptionsCardTitle}>Suivre mes dossiers</Text>
                <Text style={styles.inscriptionsCardSubtitle}>Voir l'état de mes demandes d'adhésion</Text>
              </View>
            </View>
            <View style={styles.badgeAlert}>
              <Text style={styles.badgeAlertText}>{stats.dossiersCount}</Text>
              <Ionicons name="chevron-forward" size={16} color="#BBB" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. DOCUMENTS */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mes documents</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => bottomSheetRef.current?.expand()}>
              <Ionicons name="add-circle" size={20} color="#4A78FF" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          {myDocuments.map((doc) => (
            <View key={doc.id} style={styles.docContainer}>
              <TouchableOpacity style={styles.docRow} onPress={() => openDoc(doc.title, doc.type)}>
                <Ionicons 
                  name={doc.type === 'qr' ? "qr-code-outline" : "document-attach-outline"} 
                  size={22} 
                  color={doc.type === 'qr' ? "#444" : "#4A78FF"} 
                />
                <Text style={styles.docText} numberOfLines={1}>{doc.title}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteDocument(doc.id)} style={styles.deleteIconButton}>
                <Ionicons name="trash-outline" size={18} color="#FF5A5F" />
              </TouchableOpacity>
            </View>
          ))}
        </View> */}

        {/* 5. DÉCONNEXION */}
        <View style={styles.navigationMenu}>
          <Text style={styles.navHeader}>Compte & Sécurité</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <View style={styles.navButtonContent}>
              <Ionicons name="log-out-outline" size={20} color="#FF5A5F" />
              <Text style={[styles.navButtonText, { color: '#FF5A5F' }]}>Déconnexion</Text>
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
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedDoc?.type === 'qr' ? (
              <View style={styles.qrContainer}>
                <Ionicons name="qr-code" size={200} color="black" />
                <Text style={styles.qrInstructions}>Présentez ce code à l'accueil du club</Text>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <Ionicons name="document-text" size={80} color="#4A78FF" />
                <Text style={styles.docInfo}>Certificat n°88291-TC</Text>
                <Text style={styles.docDate}>Valide jusqu'au 01/01/2027</Text>
              </View>
            )}
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color="white" />
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
        handleIndicatorStyle={{ backgroundColor: '#EEE', width: 40 }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.uploadTitle}>Ajouter un document</Text>
          <Text style={styles.uploadSubtitle}>Choisissez une méthode pour importer votre justificatif.</Text>
          <View style={styles.uploadOptionsRow}>
            <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
              <View style={[styles.optionIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="camera" size={30} color="#4CAF50" />
              </View>
              <Text style={styles.optionText}>Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
              <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="document" size={30} color="#2196F3" />
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
  container: { flex: 1, backgroundColor: '#FFF' },
  inscriptionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inscriptionsLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  inscriptionsTextContainer: { marginLeft: 12, flex: 1 },
  inscriptionsCardTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  inscriptionsCardSubtitle: { fontSize: 12, color: '#777', marginTop: 2 },
  badgeAlert: { flexDirection: 'row', alignItems: 'center' },
  badgeAlertText: { backgroundColor: '#FF5A5F', color: 'white', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  header: {
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 12,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  userLevel: { fontSize: 13, color: '#888', marginTop: 2 },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
    justifyContent: 'space-between',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase' },
  statDivider: { width: 1, height: 20, backgroundColor: '#DDD' },

  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    position: 'relative', // Nécessaire pour placer le badge rouge
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  gridBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF5A5F',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadgeText: {
    color: 'white',
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
  gridCardTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', color: '#444' },

  navigationMenu: { marginTop: 30, paddingHorizontal: 20 },
  navHeader: { fontSize: 11, fontWeight: '700', color: '#BBB', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  navButtonContent: { flexDirection: 'row', alignItems: 'center' },
  navButtonText: { marginLeft: 12, fontWeight: '500', color: '#444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 25,
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
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  qrContainer: { alignItems: 'center', padding: 20 },
  qrInstructions: { marginTop: 15, color: '#666', fontSize: 14 },
  docPlaceholder: { alignItems: 'center', padding: 30 },
  docInfo: { marginTop: 15, fontSize: 16, fontWeight: '600' },
  docDate: { color: '#888', fontSize: 13, marginTop: 5 },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#4A78FF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  downloadText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#Eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#4A78FF',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  uploadTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
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
  optionText: { fontSize: 14, fontWeight: '600', color: '#333' },
  docContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
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
    color: '#444',
    fontWeight: '500',
    flex: 1
  },
  deleteIconButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestContent: { alignItems: 'center' },
  guestIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  guestSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  loginButton: { backgroundColor: '#0E011A', width: '100%', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  registerLink: { padding: 10 },
  registerLinkText: { color: '#4A78FF', fontWeight: '600', textDecorationLine: 'underline' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, marginTop: 10 },
});