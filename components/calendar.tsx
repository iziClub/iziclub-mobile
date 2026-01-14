import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Calendar, CalendarEvent } from "react-native-big-calendar";

const { width } = Dimensions.get("window");

const EVENTS: CalendarEvent[] = [
    {
        title: "Senior M1",
        start: new Date(2026, 0, 12, 18, 0),
        end: new Date(2026, 0, 12, 20, 0),
        color: "#D42E2F",
    },
    {
        title: "U15 M1",
        start: new Date(2026, 0, 13, 17, 0),
        end: new Date(2026, 0, 13, 18, 30),
        color: "#F9BC12",
    },
    {
        title: "Senior M2",
        start: new Date(2026, 0, 14, 19, 0),
        end: new Date(2026, 0, 14, 20, 30),
        color: "#D85D12",
    },
];

export default function ClubCalendar() {
    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.title}>Calendrier des entraînements</Text>
            <Calendar
                events={EVENTS}
                height={600}
                mode="week"
                weekStartsOn={1}
                hourRowHeight={50}
                dayMinWidth={width / 5}
                startAccessor="start"
                endAccessor="end"
                eventCellStyle={(event) => ({
                    backgroundColor: event.color,
                    borderRadius: 4,
                })}
                scrollOffsetMinutes={8 * 60}
                showTime={true}
                swipeEnabled={true}
                onPressEvent={(event) => alert(`${event.title}\n${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}`)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: "700",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
});
