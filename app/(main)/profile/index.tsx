import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react'; // Pour gérer l'ouverture
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{title: string, type: 'qr' | 'doc'} | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.expand(); // Ouvre le sheet
  }, []);
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
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
    // Demander la permission
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

  // Données pour les catégories de sauvegarde (ton image)
  const savedCategories = [
  { 
    id: '1', 
    title: 'Événements likés', 
    icon: 'heart', 
    color: '#FF5A5F', 
    path: "/profile/likedEvents"
  },
  { id: '2', title: 'Clubs enregistrés', icon: 'bookmark', color: '#4A78FF', path: "/profile/savedClubs" },
  { id: '3', title: 'À venir', icon: 'calendar', color: '#FFB900', path: "/profile/upcomingEvents" },
  { id: '4', title: 'Passés', icon: 'archive', color: '#6D5AD3', path: "/profile/pastEvents" },
];

  return (
    <View style={[styles.container, { paddingTop: insets.top - 20 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* 1. HEADER PROFIL (Adapté : Plus de matchs/victoires) */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>Thomas Durand</Text>
          <Text style={styles.userLevel}>Membre depuis Janvier 2024</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Clubs suivis</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Sorties</Text>
            </View>
          </View>
        </View>

        {/* 2. SECTION SAUVEGARDES (Inspiré de ton image) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clubs et événements sauvegardés</Text>
          <View style={styles.gridContainer}>
            {savedCategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.gridCard} onPress={() => router.push(`${cat.path}`)}>
                <View style={[styles.iconCircle, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={styles.gridCardTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. DOCUMENTS (Certificat, Licence...) */}
        <View style={styles.section}>
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionTitle}>Mes documents</Text>
    <TouchableOpacity style={styles.addButton} onPress={() => bottomSheetRef.current?.expand()}>
      <Ionicons name="add-circle" size={20} color="#4A78FF" />
      <Text style={styles.addButtonText}>Ajouter</Text>
    </TouchableOpacity>
  </View>
  
  {myDocuments.map((doc) => (
  <View key={doc.id} style={styles.docContainer}>
    <TouchableOpacity 
      style={styles.docRow} 
      onPress={() => openDoc(doc.title, doc.type)}
    >
      <Ionicons 
        name={doc.type === 'qr' ? "qr-code-outline" : "document-attach-outline"} 
        size={22} 
        color={doc.type === 'qr' ? "#444" : "#4A78FF"} 
      />
      <Text style={styles.docText} numberOfLines={1}>{doc.title}</Text>
    </TouchableOpacity>

    {/* Bouton de suppression dédié */}
    <TouchableOpacity 
      onPress={() => deleteDocument(doc.id)}
      style={styles.deleteIconButton}
    >
      <Ionicons name="trash-outline" size={18} color="#FF5A5F" />
    </TouchableOpacity>
  </View>
))}
</View>

        {/* 4. MENU DE NAVIGATION (Paramètres) */}
        <View style={styles.navigationMenu}>
          <Text style={styles.navHeader}>Compte & Sécurité</Text>
          
          <TouchableOpacity onPress={() => router.push("/login")} style={styles.navButton}>
            <View style={styles.navButtonContent}>
              <Ionicons name="log-in-outline" size={20} color="#666" />
              <Text style={styles.navButtonText}>Connexion</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")} style={styles.navButton}>
            <View style={styles.navButtonContent}>
              <Ionicons name="person-add-outline" size={20} color="#666" />
              <Text style={styles.navButtonText}>Créer un compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/forgetPassword")} style={styles.navButton}>
            <View style={styles.navButtonContent}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <Text style={styles.navButtonText}>Mot de passe oublié</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        </View>

      </ScrollView>
      <Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <Pressable 
    style={styles.modalOverlay} 
    onPress={() => setModalVisible(false)}
  >
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
<BottomSheet
  ref={bottomSheetRef}
  index={-1} // Fermé par défaut
  snapPoints={snapPoints}
  enablePanDownToClose={true}
  backdropComponent={renderBackdrop}
  handleIndicatorStyle={{ backgroundColor: '#EEE', width: 40 }}
>
  <BottomSheetView style={styles.sheetContent}>
  <Text style={styles.uploadTitle}>Ajouter un document</Text>
  <Text style={styles.uploadSubtitle}>Choisissez une méthode pour importer votre justificatif.</Text>

  <View style={styles.uploadOptionsRow}>
    {/* BOUTON PHOTO */}
    <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
      <View style={[styles.optionIconCircle, { backgroundColor: '#E8F5E9' }]}>
        <Ionicons name="camera" size={30} color="#4CAF50" />
      </View>
      <Text style={styles.optionText}>Prendre une photo</Text>
    </TouchableOpacity>

    {/* BOUTON PDF */}
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
  
  section: { paddingHorizontal: 20, marginTop: 30 },
  // sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  
  // Styles pour la Grille (Inspiration image)
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
    // Ombre légère
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
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

  navigationMenu: { marginTop: 40, paddingHorizontal: 20 },
  navHeader: { fontSize: 12, fontWeight: '700', color: '#BBB', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
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
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#Eef2ff', // Bleu très clair
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
  // On ajuste le style de sectionTitle pour qu'il n'ait plus de marginBottom 
  // car c'est le parent sectionHeaderRow qui gère l'espacement maintenant
  sectionTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#1A1A1A',
    paddingBottom: 14,
  },
  uploadModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40, // Pour l'espace sur iPhone sans bouton home
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#EEE',
    borderRadius: 10,
    marginBottom: 20,
  },

  cancelButton: {
    width: '100%',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: { color: '#666', fontWeight: 'bold', fontSize: 16 },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1, // Important pour que le contenu occupe bien l'espace
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
    paddingRight: 10, // Espace pour la corbeille
  },
  docRow: {
    flex: 1, // Prend tout l'espace restant
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
});