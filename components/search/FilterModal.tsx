import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface Props {
  sheetRef: React.RefObject<BottomSheet | null>;
  radius: number;
  useRadius: boolean;           // <-- Nouvelle prop
  setUseRadius: (val: boolean) => void; // <-- Nouvelle prop
  sportQuery: string;
  setSportQuery: (val: string) => void;
  setRadius: (val: number) => void;
  selectedSort: string;
  setSelectedSort: (val: string) => void;
}

export default function FilterBottomSheet({ 
  sheetRef, 
  radius, 
  setRadius, 
  selectedSort, 
  setSelectedSort,
  useRadius,
  setUseRadius,
  sportQuery,
  setSportQuery,
}: Props) {
  // Points d'arrêt : la feuille s'ouvrira à 85% de l'écran
  const snapPoints = useMemo(() => ['85%'], []);

  // Pour assombrir l'arrière-plan quand on ouvre le menu
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  const sorts = ['Nouveau', 'Plus pertinent', 'Plus proche', 'Booster'];
  // const [useRadius, setUseRadius] = useState(true);
  return (
    <BottomSheet
      ref={sheetRef}
      index={-1} // Fermé par défaut
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#CCC', width: 40 }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtres</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.close()}>
            <Ionicons name="close-circle" size={30} color="#EEE" />
          </TouchableOpacity>
        </View>

        {/* SECTION TRI */}
        {/* <Text style={styles.sectionTitle}>Trier par</Text>
        {sorts.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={styles.radioRow} 
            onPress={() => setSelectedSort(item)}
          >
            <Text style={[styles.radioLabel, selectedSort === item && styles.activeText]}>{item}</Text>
            <View style={[styles.radioOuter, selectedSort === item && styles.radioActive]}>
              {selectedSort === item && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))} */}

        <View style={styles.divider} />

        {/* SECTION DISTANCE */}
<View style={[styles.rowBetween, { marginBottom: 10 }]}>
    <View>
        <Text style={styles.sectionTitle}>Distance</Text>
        <Text style={styles.subLabel}>Filtrer par proximité</Text>
    </View>
    <Switch 
        value={useRadius} 
        onValueChange={(newValue) => {
        setUseRadius(newValue); // <-- Doit être la fonction passée en props
    }}
        trackColor={{ false: "#E0E0E0", true: "#4A78FF" }}
        thumbColor="white"
    />
</View>

{/* On utilise l'opacité pour montrer que c'est désactivé */}
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
        disabled={!useRadius} // Désactive l'interaction
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
        />
        
        <View style={{ height: 50 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 15, marginBottom: 10 },
  subLabel: { fontSize: 13, color: '#666', marginBottom: 10 },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioLabel: { fontSize: 16, color: '#333' },
  activeText: { fontWeight: '600', color: '#000' },
  radioOuter: {
    height: 22, width: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#DDD',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#4A78FF' },
  radioInner: { height: 12, width: 12, borderRadius: 6, backgroundColor: '#4A78FF' },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distanceValue: { fontSize: 18, fontWeight: 'bold', color: '#4A78FF' },
  sportInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  }
});