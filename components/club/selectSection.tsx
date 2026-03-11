import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

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
    )};

const styles = StyleSheet.create({
    sectionsContainer: {
        maxHeight: 50,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },

    sectionsContent: {
        paddingHorizontal: 16,
        alignItems: "center",
    },

    sectionButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: "#eee",
    },

    sectionButtonActive: {
        backgroundColor: "#000",
    },

    sectionText: {
        color: "#555",
    },

    sectionTextActive: {
        color: "#fff",
    },
});