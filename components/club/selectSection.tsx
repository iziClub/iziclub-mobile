import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Colors } from "@/constants/colors";
import Tag from "@/components/ui/Tag";

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
                <Tag
                    key={section}
                    label={section}
                    variant="neutre"
                    selected={activeSection === section}
                    onPress={() => setActiveSection(section)}
                    style={styles.sectionButton}
                />
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
        marginRight: 8,
    },



});