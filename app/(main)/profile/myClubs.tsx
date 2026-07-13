import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMemberClubs } from '@/services/clubs.service';

export default function MyClubsScreen() {
  const insets = useSafeAreaInsets();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      const fetchClubs = async () => {
        setLoading(true);
        try {
          const response = await getMemberClubs();
          setClubs(response?.data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération de mes clubs affiliés :', error);
          setClubs([]);
        } finally {
          setLoading(false);
        }
      };

      fetchClubs();
    }, [])
  );

  const renderClub = ({ item }: { item: any }) => {
    const imageUrl = item.profile?.profileImagePath || item.profile?.bannerPath || 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg';
    return (
      <TouchableOpacity
        style={styles.clubCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/search/club/${item.id}`)}
      >
        <Image source={{ uri: imageUrl }} style={styles.clubImage} />
        <View style={styles.clubContent}>
          <Text style={styles.clubTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.clubSubtitle} numberOfLines={2}>{item.profile?.description || 'Club sportif affilié'}</Text>
          <View style={styles.clubMeta}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.clubMetaText} numberOfLines={1}>
              {item.profile?.address?.city || 'Ville inconnue'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container]}> 
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={22} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes clubs</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A78FF" />
          <Text style={styles.loadingText}>Chargement de vos clubs affiliés...</Text>
        </View>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={(item) => item.id}
          renderItem={renderClub}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={56} color="#CCC" />
              <Text style={styles.emptyTitle}>Aucun club affilié</Text>
              <Text style={styles.emptySubtitle}>Rejoins un club pour le retrouver ici et suivre tes informations membres.</Text>
              <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/search')}>
                <Text style={styles.exploreButtonText}>Explorer les clubs</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  clubCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  clubImage: {
    width: 100,
    height: 100,
  },
  clubContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  clubTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  clubSubtitle: { fontSize: 13, color: '#666', marginTop: 6 },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  clubMetaText: { fontSize: 12, color: '#666', flex: 1 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { marginTop: 8, color: '#777', fontSize: 14, textAlign: 'center' },
  exploreButton: {
    marginTop: 18,
    backgroundColor: '#4A78FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  exploreButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
});