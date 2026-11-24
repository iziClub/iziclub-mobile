import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { deleteMyAccount } from '@/services/account.service';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/theme';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';

/** Suppression définitive du compte : le mot de passe est redemandé pour confirmer. */
export default function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    setError(undefined);
    try {
      await deleteMyAccount(password);
      // Le compte n'existe plus : on ferme la session locale et on revient au profil invité.
      await logout();
      router.dismissTo('/profile');
      Alert.alert('Compte supprimé', 'Ton compte et tes données ont été supprimés.');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setError('Mot de passe incorrect.');
      else if (status === 429) setError('Trop de tentatives. Réessaie dans quelques minutes.');
      else setError('Suppression impossible pour le moment. Réessaie dans un instant.');
    } finally {
      setDeleting(false);
    }
  };

  const confirm = () => {
    Alert.alert('Supprimer mon compte', 'Cette action est définitive. Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: deleteAccount },
    ]);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Supprimer mon compte</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cette action est définitive.</Text>
        <Text style={styles.text}>
          Ton compte, ton profil, tes dossiers d&apos;adhésion, tes favoris et tes participations seront supprimés. Tu ne pourras pas les récupérer.
        </Text>
        <Input
          label="Mot de passe"
          placeholder="Ton mot de passe actuel"
          password
          value={password}
          onChangeText={(value) => { setPassword(value); setError(undefined); }}
          error={error}
          autoCapitalize="none"
          autoComplete="current-password"
        />
        <Button
          label="Supprimer définitivement mon compte"
          variant="danger"
          size="l"
          fullWidth
          loading={deleting}
          disabled={password.length === 0 || deleting}
          onPress={confirm}
          style={{ marginTop: 24 }}
        />
        <Button label="Annuler" variant="tertiaire" fullWidth onPress={() => router.back()} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontFamily: Fonts.titre, color: Colors.noir },
  text: { fontSize: 15, lineHeight: 22, fontFamily: Fonts.regular, color: Colors.grisTexte },
});
