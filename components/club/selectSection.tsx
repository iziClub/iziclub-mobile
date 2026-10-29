import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

interface Props {
    activeSection: string;
    setActiveSection: (section: string) => void;
    SECTIONS: string[];
}

export default function SelectSection({ activeSection, setActiveSection, SECTIONS }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sectionsContainer}
            contentContainerStyle={styles.sectionsContent}
        >
            {SECTIONS.map((section) => (
                <TouchableOpacity
                    key={section}
                    style={[
                        styles.sectionButton,
                        activeSection === section && styles.sectionButtonActive,
                    ]}
                    onPress={() => setActiveSection(section)}
                >
                    <Text
                        style={[
                            styles.sectionText,
                            activeSection === section && styles.sectionTextActive,
                        ]}
                    >
                        {section}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    sectionsContainer: {
        maxHeight: 52,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grisClair,
        backgroundColor: Colors.blanc,
    },

    sectionsContent: {
        paddingHorizontal: 16,
        alignItems: "center",
        paddingVertical: 8,
    },

    sectionButton: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        marginRight: 8,
        borderRadius: 999,
        backgroundColor: Colors.fond,
        borderWidth: 1,
        borderColor: Colors.grisClair,
    },

    sectionButtonActive: {
        backgroundColor: Colors.noir,
        borderColor: Colors.noir,
    },

    sectionText: {
        color: Colors.grisTexte,
        fontSize: 14,
        fontFamily: Fonts.medium,
    },

    sectionTextActive: {
        color: Colors.blanc,
        fontFamily: Fonts.medium,
    },
});