import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
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
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import ListItem from "@/components/ui/ListItem";

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
          colors={[Colors.noir, Colors.noirSurvol]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.guestHero}
        >
          <View style={styles.guestIconCircle}>
            <Icon name="person" size={48} color={Colors.bleu} />
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
                <Icon name={feature.icon as any} size={20} color={feature.color} />
              </View>
              <Text style={styles.guestFeatureLabel}>{feature.label}</Text>
              <Icon name="lock-closed" size={16} color={Colors.gris} />
            </View>
          ))}
        </View>

        <View style={styles.guestActions}>
          <Button label="Se connecter" size="l" fullWidth onPress={() => router.push("/(auth)/login")} />
          <Button label="Créer un compte" variant="secondaire" size="l" fullWidth onPress={() => router.push("/(auth)/register")} />
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
        </View>

        {/* 2. ACCÈS DIRECT */}
        <View style={styles.section}>
          <View style={styles.gridContainer}>
            {savedCategories.map((cat) => (
              <Card key={cat.id} bordered style={styles.gridCard} onPress={() => router.push({ pathname: cat.path })}>
                <View style={[styles.iconCircle, { backgroundColor: cat.color + '15' }]}>
                  <Icon name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={styles.gridCardTitle}>{cat.title}</Text>

                {/* Badge rouge dynamique si présent */}
                {cat.badge && cat.badge > 0 ? (
                  <View style={styles.gridBadge}>
                    <Text style={styles.gridBadgeText}>{cat.badge}</Text>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        </View>

        {/* 3. SECTION : MES INSCRIPTIONS (Ligne élégante isolée) */}
        <View style={styles.section}>
          <Card
            bordered
            style={styles.inscriptionsCard}
            onPress={() => router.push("/profile/inscriptions")}
          >
            <View style={styles.inscriptionsLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.bleuClair, marginBottom: 0 }]}>
                <Icon name="document-text-outline" size={22} color={Colors.bleu} />
              </View>
              <View style={styles.inscriptionsTextContainer}>
                <Text style={styles.inscriptionsCardTitle}>Suivre mes dossiers</Text>
                <Text style={styles.inscriptionsCardSubtitle}>Voir l'état de mes demandes d'adhésion</Text>
              </View>
            </View>
            <View style={styles.badgeAlert}>
              <Text style={styles.badgeAlertText}>{stats.dossiersCount}</Text>
              <Icon name="chevron-forward" size={16} color={Colors.gris} style={{ marginLeft: 4 }} />
            </View>
          </Card>
        </View>

        {/* 5. DÉCONNEXION */}
        <View style={styles.navigationMenu}>
          <Text style={styles.navHeader}>Compte & Sécurité</Text>
          <ListItem label="Déconnexion" icon="log-out-outline" danger chevron={false} onPress={logout} />
        </View>
      </ScrollView>

      {/* MODAL DOCUMENT PREVIEW */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDoc?.title}</Text>
              <IconButton name="close" variant="fantome" accessibilityLabel="Fermer" onPress={() => setModalVisible(false)} />
            </View>
            {selectedDoc?.type === 'qr' ? (
              <View style={styles.qrContainer}>
                <Icon name="qr-code" size={200} color={Colors.noir} />
                <Text style={styles.qrInstructions}>Présentez ce code à l'accueil du club</Text>
              </View>
            ) : (
              <View style={styles.docPlaceholder}>
                <Icon name="document-text" size={80} color={Colors.bleu} />
                <Text style={styles.docInfo}>Certificat n°88291-TC</Text>
                <Text style={styles.docDate}>Valide jusqu'au 01/01/2027</Text>
              </View>
            )}
            <Button label="Télécharger le PDF" icon="download-outline" size="l" style={{ marginTop: 20 }} />
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
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.uploadOption, pressed && { opacity: 0.6 }]} onPress={takePhoto}>
              <View style={[styles.optionIconCircle, { backgroundColor: Colors.vertClair }]}>
                <Icon name="camera" size={30} color={Colors.vert} />
              </View>
              <Text style={styles.optionText}>Prendre une photo</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.uploadOption, pressed && { opacity: 0.6 }]} onPress={pickDocument}>
              <View style={[styles.optionIconCircle, { backgroundColor: Colors.bleuClair }]}>
                <Icon name="document" size={30} color={Colors.bleu} />
              </View>
              <Text style={styles.optionText}>Fichier PDF</Text>
            </Pressable>
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
  },
  inscriptionsLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  inscriptionsTextContainer: { marginLeft: 12, flex: 1 },
  inscriptionsCardTitle: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir },
  inscriptionsCardSubtitle: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, marginTop: 2 },
  badgeAlert: { flexDirection: 'row', alignItems: 'center' },
  badgeAlertText: { backgroundColor: Colors.rouge, color: Colors.blanc, fontSize: 12, fontFamily: Fonts.medium, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
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
  userName: { fontSize: 24, fontFamily: Fonts.titre, color: Colors.noir },
  userLevel: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, marginTop: 2 },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
    justifyContent: 'space-between',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  statLabel: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 20, backgroundColor: Colors.grisClair },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.noir,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  gridBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.rouge,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadgeText: {
    color: Colors.blanc,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardTitle: { fontSize: 14, fontFamily: Fonts.medium, textAlign: 'center', color: Colors.noir },

  navigationMenu: { marginTop: 32, paddingHorizontal: 20 },
  navHeader: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.grisTexte, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
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
  modalTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  qrContainer: { alignItems: 'center', padding: 20 },
  qrInstructions: { marginTop: 16, color: Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular },
  docPlaceholder: { alignItems: 'center', padding: 32 },
  docInfo: { marginTop: 16, fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir },
  docDate: { color: Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular, marginTop: 4 },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.blanc,
  },
  uploadTitle: { fontSize: 20, fontFamily: Fonts.titre, color: Colors.noir },
  uploadSubtitle: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
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
    marginBottom: 12,
  },
  optionText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.noir },
  guestHero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
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
  guestTitle: { fontSize: 24, fontFamily: Fonts.titre, color: Colors.blanc, marginBottom: 8, textAlign: 'center' },
  guestSubtitle: { fontSize: 16, fontFamily: Fonts.regular, color: Colors.grisClair, textAlign: 'center', lineHeight: 21 },
  guestFeatureList: {
    marginTop: -20,
    marginHorizontal: 20,
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  guestFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  guestFeatureLabel: { flex: 1, fontSize: 14, color: Colors.noir, fontFamily: Fonts.medium },
  guestActions: { paddingHorizontal: 32, marginTop: 28, gap: 12 },
});