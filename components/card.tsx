import React from "react";
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";
import UiCard from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

interface CardProps {
  title: string;
  banner?: string;
  avatar?: string;
  address?: string;
  distanceInKm?: number;
  tags?: string[];
  type: "club" | "event";
  onPress?: () => void;
  width?: number | string;
}

export default function Card({
  title,
  banner,
  avatar,
  address,
  distanceInKm,
  tags,
  type,
  onPress,
  width = "100%",
}: CardProps) {
  // console.info("Rendering Card with props:", {
  //   distanceInKm, title
  // });
  return (
    <UiCard bordered padding={0} style={[styles.card, { width: width as any }]}>
      {/* Bannière */}
      {banner ? (
        <Image source={{ uri: banner }} style={styles.banner} />
      ) : (
        <View style={styles.bannerPlaceholder} />
      )}

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View />
        )}
      </View>

      {/* Contenu (pressable) */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.content, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {address && (
          <View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 4 }}>
              <Icon name="map-marker" size={14} color={Colors.bleu} style={{ marginTop: 8 }} />

              <View style={{ minHeight: 40, marginLeft: 4, flex: 1 }}>
                <Text style={styles.address} numberOfLines={2}>
                  {address}
                </Text>
              </View>
            </View>
            {distanceInKm != undefined && (
              <Text style={styles.address}>à {distanceInKm} km de vous</Text>
            )}
            {distanceInKm == undefined && (
              <Text style={styles.address}>Distance indisponible</Text>
            )
            }
          </View>
        )}
      </Pressable>

      {/* Tags (outside Pressable so they can scroll) */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        <View style={{ marginTop: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingRight: 12 }}
          >
            {/* Tag type (club/event) */}
            <Tag
              label={type === "club" ? "Club" : "Événement"}
              icon={type === "club" ? "account-group" : "calendar"}
              variant={type === "club" ? "doux" : "danger"}
            />

            {/* Autres tags */}
            {/* {tags?.map((tag, index) => (
              <View key={index} style={[styles.extraTag, { flexShrink: 0 }]}>
                <Text style={styles.extraTagText}>{tag}</Text>
              </View>
            ))} */}
          </ScrollView>
        </View>
      </View>
    </UiCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },

  banner: {
    width: "100%",
    height: 80,
    backgroundColor: Colors.fond,
  },
  bannerPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: Colors.fond,
  },

  avatarWrapper: {
    position: "absolute",
    top: 55,
    left: "20%",
    transform: [{ translateX: -25 }],
    zIndex: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.blanc,
    backgroundColor: Colors.grisClair,
  },

  content: {
    paddingTop: 24,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.noir,
  },
  address: {
    marginTop: 4,
    color: Colors.grisTexte,
    fontSize: 14, fontFamily: Fonts.regular,
  },
  extraTag: {
    marginTop: 8,
    backgroundColor: Colors.fond,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  extraTagText: {
    fontSize: 12,
    color: Colors.noir,
    fontFamily: Fonts.medium,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
