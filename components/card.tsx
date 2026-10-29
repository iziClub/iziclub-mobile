import React from "react";
import { View, Text, Image, StyleSheet, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";
import Icon from "@/components/ui/Icon";

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
    <View style={[styles.cardShadow, { width }]}>
    <View style={styles.card}>
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
      <TouchableOpacity onPress={onPress} style={styles.content}>
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
      </TouchableOpacity>

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
            <View style={[styles.tag, type === "club" ? styles.clubTag : styles.eventTag]}>
              <Icon
                name={type === "club" ? "account-group" : "calendar"}
                size={14}
                color={Colors.blanc}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.tagText}>{type === "club" ? "Club" : "Événement"}</Text>
            </View>

            {/* Autres tags */}
            {/* {tags?.map((tag, index) => (
              <View key={index} style={[styles.extraTag, { flexShrink: 0 }]}>
                <Text style={styles.extraTagText}>{tag}</Text>
              </View>
            ))} */}
          </ScrollView>
        </View>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },
  card: {
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    overflow: "hidden",
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
  avatarPlaceholder: {
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
  tag: {
    marginTop: 8,
    backgroundColor: Colors.fond,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  clubTag: {
    marginTop: 8,
    backgroundColor: Colors.bleuClair,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  eventTag: {
    marginTop: 8,
    backgroundColor: Colors.rougeClair,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  tagText: {
    color: Colors.noir,
    fontSize: 12,
    fontFamily: Fonts.medium,
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
