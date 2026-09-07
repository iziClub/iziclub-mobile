import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB", // Fond légèrement grisé pour faire ressortir les cartes blanches
    },
    badgeContainer: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1F2937",
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cityText: {
        fontSize: 16,
        color: "#4A78FF",
        fontWeight: "600",
    },
    card: {
        backgroundColor: "white",
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 10,
    },
    addressText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 2,
    },
    subAddressText: {
        fontSize: 15,
        color: "#6B7280",
    },
    mapCard: {
        backgroundColor: "white",
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    mapContainer: {
        height: 180,
        backgroundColor: "#E5E7EB",
    },
    map: {
        ...StyleSheet.absoluteFill,
    },
    navButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4A78FF", // Utilise la couleur primaire de ton app
        paddingVertical: 14,
        margin: 16,
        borderRadius: 12,
    },
    navButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    noticeContainer: {
        flexDirection: "row",
        paddingHorizontal: 32,
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 40,
    },
    noticeText: {
        fontSize: 13,
        color: "#9CA3AF",
        flex: 1,
        lineHeight: 18,
    },
});