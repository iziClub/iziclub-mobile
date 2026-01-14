import { View, FlatList, Text, ActivityIndicator } from "react-native";
import React from "react";
import * as Location from "expo-location";
import Card from "../../../components/card";
import { useRouter } from "expo-router";

interface Props {
  query?: string;
  type?: string;
  city?: string;
  radius?: number;
  locationEnabled?: boolean;
}

const MOCK_CLUBS = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  name: `Club ${i + 1}`,
  type: ["Fitness", "Football", "Tennis", "Yoga", "Crossfit"][i % 5],
  city: ["Paris", "Lyon", "Marseille", "Lille", "Bordeaux"][i % 5],
  addressLine1: `${10 + i} rue du Sport`,
  imageUrl: `https://picsum.photos/seed/avatar${i}/300/300`,
  bannerImageUrl: `https://picsum.photos/seed/banner${i}/600/400`,
  distance: (Math.random() * 15 + 0.5).toFixed(1),
}));

const fakeGetClubs = async ({
  q,
  type,
  city,
  per_page = 20,
  page = 1,
}: any) => {
  await new Promise((r) => setTimeout(r, 600));

  let data = [...MOCK_CLUBS];

  if (q) {
    data = data.filter((c) =>
      c.name.toLowerCase().includes(q.toLowerCase())
    );
  }

  if (type) {
    data = data.filter((c) => c.type === type);
  }

  if (city) {
    data = data.filter((c) => c.city === city);
  }

  const start = (page - 1) * per_page;
  const end = start + per_page;

  return {
    data: data.slice(start, end),
    total: data.length,
  };
};


export default function ClubsTab({ query, type, city, radius = 50, locationEnabled }: Props) {
  const [clubs, setClubs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [fetchingMore, setFetchingMore] = React.useState(false);
  const router = useRouter();
  const fetchClubsNearby = async (pageNumber: number) => {
    if (!hasMore) return;

    if (pageNumber === 1) setLoading(true);
    else setFetchingMore(true);

    let coords = { latitude: 48.85691628304146, longitude: 2.362998650782099 };

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        // coords = {
        //   latitude: location.coords.latitude,
        //   longitude: location.coords.longitude,
        // };
      }
    } catch (e) {
      console.warn("Erreur localisation :", e);
    }

    const clubsData = await fakeGetClubs({
      q: query,
      type,
      city,
      latitude: locationEnabled ? coords.latitude : undefined,
      longitude: locationEnabled ? coords.longitude : undefined,
      radius_km: locationEnabled ? radius : undefined,
      per_page: 20,
      page: pageNumber,
    });

    if (clubsData.data.length === 0) {
      setHasMore(false);
    } else {
      setClubs((prev) => (pageNumber === 1 ? clubsData.data : [...prev, ...clubsData.data]));
    }

    setLoading(false);
    setFetchingMore(false);
  };

  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchClubsNearby(1);
  }, [query, type, city, radius, locationEnabled]);

  const loadMore = () => {
    if (!fetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClubsNearby(nextPage);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
      {loading && (
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <ActivityIndicator size="large" color="#0000ff" />
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
            onPress={() =>
              router.push({
                pathname: "/(main)/search/club/[id]",
                params: { id: item.id.toString() },
              })
            }
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
              <ActivityIndicator size="large" color="#000000ff" />
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
