import React from "react";
import { Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

interface TeamCardProps {
    title: string;
    color?: string;
    subtitle?: string;
}

function lightenColor(hex: string, amount = 0.25) {
    const num = parseInt(hex.replace("#", ""), 16);

    const r = Math.min(255, ((num >> 16) & 0xff) + 255 * amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount);
    const b = Math.min(255, (num & 0xff) + 255 * amount);

    return `rgb(${r}, ${g}, ${b})`;
}

export default function TeamCard({
    title,
    color = Colors.bleu,
    subtitle,
}: TeamCardProps) {
    const lighterColor = lightenColor(color, 0.3);

    return (
        <LinearGradient
            colors={[lighterColor, color]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
        >
            <Text style={styles.title}>{title}</Text>
            {/* {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>} */}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontFamily: Fonts.titre,
        color: Colors.blanc,
    },
    subtitle: {
        fontSize: 14, fontFamily: Fonts.regular,
        color: Colors.blanc,
        marginTop: 4,
        textAlign: "right",
    },
});
