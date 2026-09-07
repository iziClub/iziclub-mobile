import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

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
  onReset?: () => void;
}

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
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={30} color="#EEE" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.content}>
            {/* SECTION DISTANCE */}
            <View style={[styles.rowBetween, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.sectionTitle}>Distance</Text>
                <Text style={styles.subLabel}>Filtrer par proximité</Text>
              </View>
              <Switch
                value={useRadius}
                onValueChange={setUseRadius}
                trackColor={{ false: "#E0E0E0", true: "#4A78FF" }}
                thumbColor="white"
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
                minimumTrackTintColor="#4A78FF"
                thumbTintColor={useRadius ? "#4A78FF" : "#CCC"}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Sport</Text>
            <TextInput
              style={styles.sportInput}
              placeholder="Ex: Handball, Escalade..."
              placeholderTextColor="#999"
              value={sportQuery}
              onChangeText={setSportQuery}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                onReset?.();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.applyButtonText}>Voir les résultats</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CCC',
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 15, marginBottom: 10 },
  subLabel: { fontSize: 13, color: '#666', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 15, marginHorizontal: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distanceValue: { fontSize: 18, fontWeight: 'bold', color: '#4A78FF' },
  sportInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  resetButtonText: { fontWeight: '700', fontSize: 15, color: '#333' },
  applyButton: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A78FF',
  },
  applyButtonText: { fontWeight: '700', fontSize: 15, color: 'white' },
});