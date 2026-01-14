import React from "react";
import { Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    color = "#0000FF",
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
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 150,
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    subtitle: {
        fontSize: 14,
        color: "#fff",
        marginTop: 4,
        textAlign: "right",
    },
});
