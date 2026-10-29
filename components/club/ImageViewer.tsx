import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, Modal, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import IconButton from "@/components/ui/IconButton";

interface Props {
  images: string[];
  /** Index de la photo ouverte, null si le visualiseur est fermé */
  index: number | null;
  onClose: () => void;
}

export default function ImageViewer({ images, index, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (index !== null) setCurrent(index);
  }, [index]);

  return (
    <Modal visible={index !== null} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        {index !== null && (
          <FlatList
            ref={listRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, i) => `${i}-${uri}`}
            initialScrollIndex={index}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={{ width, height, justifyContent: "center" }}>
                <Image source={{ uri: item }} style={{ width, height: height * 0.8 }} resizeMode="contain" />
              </View>
            )}
          />
        )}

        <IconButton
          name="close"
          variant="fantome"
          iconSize={24}
          color={Colors.blanc}
          accessibilityLabel="Fermer"
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
        />

        <View style={[styles.counter, { bottom: insets.bottom + 24 }]}>
          <Text style={styles.counterText}>{current + 1} / {images.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)" },
  closeBtn: {
    position: "absolute",
    right: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  counter: { position: "absolute", alignSelf: "center" },
  counterText: { color: Colors.blanc, fontFamily: Fonts.medium, fontSize: 14 },
});
