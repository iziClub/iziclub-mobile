import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMemberClubs } from '@/services/clubs.service';
import { Colors } from '@/constants/colors';
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
      <Card bordered padding={0}
        style={styles.clubCard}
        onPress={() => router.push({ pathname: `/search/club/${item.id}`, params: { from: 'myClubs' } })}>
        <Image source={{ uri: imageUrl }} style={styles.clubImage} />
        <View style={styles.clubContent}>
          <Text style={styles.clubTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.clubSubtitle} numberOfLines={2}>{item.profile?.description || 'Club sportif affilié'}</Text>
          <View style={styles.clubMeta}>
            <Icon name="location-outline" size={14} color={Colors.bleu} />
            <Text style={styles.clubMetaText} numberOfLines={1}>
              {item.profile?.address?.city || 'Ville inconnue'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container]}> 
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Mes clubs</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.noir} />
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
              <Icon name="people-outline" size={56} color={Colors.gris} />
              <Text style={styles.emptyTitle}>Aucun club affilié</Text>
              <Text style={styles.emptySubtitle}>Rejoins un club pour le retrouver ici et suivre tes informations membres.</Text>
              <Button label="Explorer les clubs" onPress={() => router.push('/search')} style={{ marginTop: 20 }} />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.fond },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grisClair,
    backgroundColor: Colors.blanc,
  },
  headerTitle: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fond },
  loadingText: { marginTop: 12, color: Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular },
  clubCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  clubImage: {
    width: 100,
    height: 100,
  },
  clubContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  clubTitle: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.noir },
  clubSubtitle: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, marginTop: 8 },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  clubMetaText: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grisTexte, flex: 1 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 16, fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  emptySubtitle: { marginTop: 8, color: Colors.grisTexte, fontSize: 14, fontFamily: Fonts.regular, textAlign: 'center' },
});