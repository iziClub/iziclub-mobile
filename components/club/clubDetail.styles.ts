import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fond,
    },
    badgeContainer: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bleuClair,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        color: Colors.bleu,
        fontFamily: Fonts.medium,
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontFamily: Fonts.titre,
        color: Colors.noir,
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
        color: Colors.bleu,
        fontFamily: Fonts.medium,
    },
    card: {
        backgroundColor: Colors.blanc,
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.grisClair,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: Colors.grisTexte,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },
    addressText: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: Colors.noir,
        marginBottom: 2,
    },
    subAddressText: {
        fontSize: 16, fontFamily: Fonts.regular,
        color: Colors.grisTexte,
    },
    mapCard: {
        backgroundColor: Colors.blanc,
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.grisClair,
        overflow: "hidden",
        marginBottom: 20,
    },
    mapContainer: {
        height: 180,
        backgroundColor: Colors.fond,
    },
    map: {
        ...StyleSheet.absoluteFill,
    },
    navButton: {
        margin: 16,
    },
    noticeContainer: {
        flexDirection: "row",
        paddingHorizontal: 32,
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        marginBottom: 40,
    },
    noticeText: {
        fontSize: 14, fontFamily: Fonts.regular,
        color: Colors.grisTexte,
        flex: 1,
        lineHeight: 18,
    },
});