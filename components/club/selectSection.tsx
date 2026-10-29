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
        maxHeight: 60,
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
        minHeight: 40,
        justifyContent: "center",
        marginRight: 8,
        borderRadius: 999,
        backgroundColor: Colors.blanc,
        borderWidth: 1.5,
        borderColor: Colors.noir,
    },

    sectionButtonActive: {
        backgroundColor: Colors.noir,
        borderColor: Colors.noir,
    },

    sectionText: {
        color: Colors.noir,
        fontSize: 14,
        fontFamily: Fonts.medium,
    },

    sectionTextActive: {
        color: Colors.blanc,
        fontFamily: Fonts.medium,
    },
});