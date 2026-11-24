import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentUser } from '@/services/auth';
import { updateMyProfile } from '@/services/account.service';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/theme';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type Profile = { firstName: string; lastName: string; email: string };

/** Modification de ses informations : prénom, nom, adresse email. */
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const [initial, setInitial] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({ firstName: '', lastName: '', email: '' });
  const [emailError, setEmailError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((me) => {
        if (!active || !me) return;
        const profile = { firstName: me.firstName ?? '', lastName: me.lastName ?? '', email: me.email ?? '' };
        setInitial(profile);
        setForm(profile);
      })
      .catch(() => {
        if (active) Alert.alert('Chargement impossible', 'Vérifie ta connexion et réessaie.', [{ text: 'OK', onPress: () => router.back() }]);
      });
    return () => {
      active = false;
    };
  }, []);

  const trimmed: Profile = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim().toLowerCase(),
  };
  const changed =
    initial !== null &&
    (trimmed.firstName !== initial.firstName || trimmed.lastName !== initial.lastName || trimmed.email !== initial.email.toLowerCase());
  const valid = trimmed.firstName.length > 0 && trimmed.lastName.length > 0 && isValidEmail(trimmed.email);

  const save = async () => {
    if (!initial) return;
    setSaving(true);
    setEmailError(undefined);
    try {
      // On n'envoie que ce qui a changé.
      await updateMyProfile({
        ...(trimmed.firstName !== initial.firstName ? { firstName: trimmed.firstName } : {}),
        ...(trimmed.lastName !== initial.lastName ? { lastName: trimmed.lastName } : {}),
        ...(trimmed.email !== initial.email.toLowerCase() ? { email: trimmed.email } : {}),
      });
      const emailChanged = trimmed.email !== initial.email.toLowerCase();
      Alert.alert(
        'Profil mis à jour',
        emailChanged ? `Tu te connecteras désormais avec ${trimmed.email}.` : 'Tes informations ont été enregistrées.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      if (e?.response?.status === 409) setEmailError('Cette adresse est déjà utilisée par un autre compte.');
      else Alert.alert('Enregistrement impossible', 'Une erreur est survenue. Réessaie dans un instant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <IconButton name="arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Modifier mes informations</Text>
        <View style={{ width: 44 }} />
      </View>

      {initial === null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.noir} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Prénom" value={form.firstName} onChangeText={(firstName) => setForm((f) => ({ ...f, firstName }))} autoComplete="given-name" required />
          <Input label="Nom" value={form.lastName} onChangeText={(lastName) => setForm((f) => ({ ...f, lastName }))} autoComplete="family-name" required />
          <Input
            label="Email"
            value={form.email}
            onChangeText={(email) => { setForm((f) => ({ ...f, email })); setEmailError(undefined); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            hint="C'est l'adresse avec laquelle tu te connectes."
            error={emailError}
            required
          />
          <Button
            label="Enregistrer"
            size="l"
            fullWidth
            loading={saving}
            disabled={!changed || !valid || saving}
            onPress={save}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, gap: 16 },
});
