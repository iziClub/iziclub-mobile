import React from "react";
import { View, Text, Image, StyleSheet, Pressable, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface CardProps {
  title: string;
  banner?: string;
  avatar?: string;
  address?: string;
  distance?: string;
  tags?: string[];
  type: "club" | "event";
  onPress?: () => void;
}

export default function Card({
  title,
  banner,
  avatar,
  address,
  distance,
  tags,
  type,
  onPress,
}: CardProps) {
  return (
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
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Icon name="map-marker" size={14} color="#666" style={{ marginTop: 6 }} />
              <Text style={styles.address} numberOfLines={3}>
                {address}
              </Text>
            </View>
            {distance && (
              <Text style={styles.address}>{distance} km away</Text>
            )}
            {!distance && (
              <Text style={styles.address}>Distance unavailable</Text>
            )
            }
          </View>
        )}
      </TouchableOpacity>

      {/* Tags (outside Pressable so they can scroll) */}
      <View style={{ paddingHorizontal: 10, paddingBottom: 12 }}>
        <View style={{ marginTop: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingRight: 10 }}
          >
            {/* Tag type (club/event) */}
            <View style={[styles.tag, type === "club" ? styles.clubTag : styles.eventTag]}>
              <Icon
                name={type === "club" ? "account-group" : "calendar"}
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.tagText}>{type === "club" ? "Club" : "Événement"}</Text>
            </View>

            {/* Autres tags */}
            {tags?.map((tag, index) => (
              <View key={index} style={[styles.extraTag, { flexShrink: 0 }]}>
                <Text style={styles.extraTagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "49%",
    backgroundColor: "white",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  banner: {
    width: "100%",
    height: 80,
    backgroundColor: "#ddd",
  },
  bannerPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: "#e5e5e5",
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
    borderColor: "white",
    backgroundColor: "#ccc",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#dbdbdb",
  },

  content: {
    paddingTop: 25,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  address: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },
  tag: {
    marginTop: 8,
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  clubTag: {
    marginTop: 8,
    backgroundColor: "#282051",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  eventTag: {
    marginTop: 8,
    backgroundColor: "#FB791B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  extraTag: {
    marginTop: 8,
    backgroundColor: "#F7F6F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginLeft: 6,
  },
  extraTagText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
