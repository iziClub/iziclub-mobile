import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Tag from "@/components/ui/Tag";
import Input from "@/components/ui/Input";

interface Props {
  visible: boolean;
  onClose: () => void;
  radius: number;
  useRadius: boolean;
  setUseRadius: (val: boolean) => void;
  sportQuery: string;
  setSportQuery: (val: string) => void;
  setRadius: (val: number) => void;
  selectedSort: string;
  setSelectedSort: (val: string) => void;
  eventType: string;
  setEventType: (val: string) => void;
  onReset?: () => void;
}

const EVENT_TYPES: { value: string; label: string }[] = [
  { value: 'training', label: 'Entraînement' },
  { value: 'friendly_match', label: 'Match amical' },
  { value: 'tournament', label: 'Tournoi' },
  { value: 'technique_session', label: 'Séance technique' },
  { value: 'gala', label: 'Gala' },
  { value: 'championship', label: 'Championnat' },
  { value: 'mixed_session', label: 'Séance mixte' },
];

const SHEET_HEIGHT = Math.round(Dimensions.get('window').height * 0.72);

export default function FilterBottomSheet({
  visible,
  onClose,
  radius,
  setRadius,
  useRadius,
  setUseRadius,
  sportQuery,
  setSportQuery,
  eventType,
  setEventType,
  onReset,
}: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, mass: 0.9, stiffness: 180 }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6 && gesture.dy > 0,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > SHEET_HEIGHT * 0.25 || gesture.vy > 0.8) {
          onClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, mass: 0.9, stiffness: 180 }).start();
        }
      },
    })
  ).current;

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={StyleSheet.absoluteFill}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { height: SHEET_HEIGHT, transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleArea}>
            <View style={styles.handleBar} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Filtres</Text>
            <IconButton name="close" variant="fantome" accessibilityLabel="Fermer les filtres" onPress={onClose} />
          </View>

          <View style={styles.divider} />

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* SECTION DISTANCE */}
            <View style={[styles.rowBetween, { marginBottom: 12 }]}>
              <View>
                <Text style={styles.sectionTitle}>Distance</Text>
                <Text style={styles.subLabel}>Filtrer par proximité</Text>
              </View>
              <Switch
                value={useRadius}
                onValueChange={setUseRadius}
                trackColor={{ false: Colors.grisClair, true: Colors.noir }}
                thumbColor={Colors.blanc}
              />
            </View>

            <View style={{ opacity: useRadius ? 1 : 0.3 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.subLabel, { marginBottom: 0 }]}>
                  Distance maximale entre ma position et le club
                </Text>
                {useRadius && <Text style={styles.distanceValue}>{radius}km</Text>}
              </View>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={radius}
                onValueChange={setRadius}
                disabled={!useRadius}
                minimumTrackTintColor={Colors.noir}
                thumbTintColor={useRadius ? Colors.noir : Colors.grisClair}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Sport (événements)</Text>
            <Input
              accessibilityLabel="Sport"
              placeholder="Ex: Handball, Escalade..."
              value={sportQuery}
              onChangeText={setSportQuery}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Type d'événement</Text>
            <Text style={styles.subLabel}>Ne s'applique qu'à l'onglet Événements</Text>
            <View style={styles.chipsWrap}>
              <Tag label="Tous" selected={!eventType} onPress={() => setEventType('')} />
              {EVENT_TYPES.map((item) => (
                <Tag
                  key={item.value}
                  label={item.label}
                  selected={eventType === item.value}
                  onPress={() => setEventType(eventType === item.value ? '' : item.value)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Réinitialiser"
              variant="secondaire"
              size="l"
              style={styles.resetButton}
              onPress={() => {
                onReset?.();
              }}
            />

            <Button label="Voir les résultats" size="l" style={styles.applyButton} onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22,19,22,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blanc,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: Colors.noir,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.grisClair,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: { fontSize: 32, fontFamily: Fonts.titre, color: Colors.noir },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.titre, marginTop: 16, marginBottom: 12, color: Colors.noir },
  subLabel: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.grisTexte, marginBottom: 12 },
  divider: { height: 1, backgroundColor: Colors.grisClair, marginVertical: 16, marginHorizontal: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distanceValue: { fontSize: 18, fontFamily: Fonts.titre, color: Colors.noir },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.grisClair,
  },
  resetButton: { flex: 1 },
  applyButton: { flex: 1.4 },
});