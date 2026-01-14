import React from "react";
import { View, FlatList, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import Card from "../card";
import { getClubs } from "@/services/clubs.service";

interface ListProps {
  query?: string;
  type?: string;
  city?: string;
  radius?: number;
  locationEnabled?: boolean;
}

export default function ClubsList({
  query,
  type,
  city,
  radius = 50,
  locationEnabled,
}: ListProps) {
  const [clubs, setClubs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [fetchingMore, setFetchingMore] = React.useState(false);

  const fetchClubs = async (pageNumber: number) => {
    if (!hasMore) return;

    if (pageNumber === 1) {
      setClubs([]);
      setLoading(true);
    }
    else setFetchingMore(true);

    let coords;

    if (locationEnabled) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          coords = {
            // latitude: location.coords.latitude,
            // longitude: location.coords.longitude,
            latitude: 48.85712301088664,
            longitude: 2.363616001901619,
          };
        }
      } catch {
        coords = undefined;
      }
    }

    const params: any = {
      per_page: 20,
      page: pageNumber,
    };

    if (query && query.trim() !== "") {
      params.q = query;
    }

    if (type) params.type = type;
    if (city) params.city = city;
    if (locationEnabled && coords) {
      params.latitude = coords.latitude;
      params.longitude = coords.longitude;
      params.radius_km = radius;
    }

    const clubsData = await getClubs(params);
    console.log("API RESPONSE:", params);
    if (clubsData.data.length === 0) {
      setHasMore(false);
    } else {
      setClubs((prev) =>
        pageNumber === 1 ? clubsData.data : [...prev, ...clubsData.data]
      );
    }

    setLoading(false);
    setFetchingMore(false);
  };

  // refresh list when filters change
  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchClubs(1);
  }, [query, type, city, radius, locationEnabled]);

  const loadMore = () => {
    if (!fetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClubs(nextPage);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
      {loading && (
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Chargement des clubs...</Text>
        </View>
      )}

      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <Card
            title={item.name}
            type="club"
            avatar={item.imageUrl}
            banner={item.bannerImageUrl}
            address={`${item.addressLine1}, ${item.city}`}
            distance={item.distance?.toString()}
            tags={[item.type]}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          fetchingMore ? (
            <View
              style={{
                paddingVertical: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: "#555" }}>
                Chargement des clubs...
              </Text>
            </View>
          ) : (
            <View />
          )
        }
      />
    </View>
  );
}
