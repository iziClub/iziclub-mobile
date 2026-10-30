import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

interface TeamCardProps {
    title: string;
    color?: string;
    subtitle?: string;
}

export default function TeamCard({
    title,
    color = Colors.bleu,
}: TeamCardProps) {
    return (
        <View style={[styles.card, { backgroundColor: color }]}>
            <Text style={styles.title}>{title}</Text>
        </View>
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
