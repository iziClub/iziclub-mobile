import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Calendar, CalendarEvent } from "react-native-big-calendar";

const { width } = Dimensions.get("window");

// Mapping pour lier les chaînes de l'API aux index de jour de JavaScript (0 = Dimanche, 1 = Lundi, etc.)
const DAYS_MAP: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

// Couleurs par défaut au cas où la catégorie n'a pas de couleur définie
const DEFAULT_COLORS = ["#D42E2F", "#D85D12", "#F9BC12", "#007AFF", "#28A745", "#6F42C1"];

interface Session {
    id: string;
    name: string;
    dayOfWeek: string;
    startTime: string; // Ex: "19:00"
    endTime: string;   // Ex: "20:30"
    description?: string;
    category?: {
        id: string;
        name: string;
        color: string | null;
    };
}

interface Props {
    sessions: Session[] | undefined;
}

export default function ClubCalendar({ sessions }: Props) {
    
    // Transformation des sessions récurrentes en dates de la semaine en cours
    const formattedEvents = useMemo(() => {
        if (!sessions) return [];

        const today = new Date();
        const currentDayIndex = today.getDay(); // Jours actuels (0-6)

        return sessions.map((session, index) => {
            const targetDayIndex = DAYS_MAP[session.dayOfWeek.toLowerCase()] ?? 1;
            
            // Calcul de l'écart de jours pour tomber sur le bon jour de la semaine en cours
            const dayDifference = targetDayIndex - currentDayIndex;
            
            // Création de la date de base pour ce jour de la semaine
            const eventDate = new Date(today);
            eventDate.setDate(today.getDate() + dayDifference);

            // Parsing des heures et minutes (ex: "19:00" -> hours: 19, minutes: 0)
            const [startHours, startMinutes] = session.startTime.split(":").map(Number);
            const [endHours, endMinutes] = session.endTime.split(":").map(Number);

            const start = new Date(eventDate);
            start.setHours(startHours, startMinutes, 0, 0);

            const end = new Date(eventDate);
            end.setHours(endHours, endMinutes, 0, 0);

            // Récupération de la couleur (catégorie ou couleur par défaut)
            const color = session.category?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

            return {
                title: session.category?.name ? `${session.category.name} - ${session.name}` : session.name,
                start,
                end,
                color,
                description: session.description,
            };
        });
    }, [sessions]);

    // Trouver l'heure de début du premier entraînement pour caler le défilement automatique de manière propre (UX)
    const minHourStart = useMemo(() => {
        if (!sessions || sessions.length === 0) return 8 * 60; // 08:00 par défaut
        const hours = sessions.map(s => parseInt(s.startTime.split(":")[0], 10));
        const earliestHour = Math.min(...hours);
        return Math.max(0, (earliestHour - 1) * 60); // On scroll 1h avant le premier cours
    }, [sessions]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calendrier des entraînements</Text>
            <Calendar
                events={formattedEvents}
                height={650}
                mode="week"
                weekStartsOn={1} // La semaine commence le Lundi
                hourRowHeight={60} // Un peu plus grand pour une meilleure lisibilité tactile
                dayMinWidth={width / 4.5} // Largeur adaptative des colonnes
                startAccessor="start"
                endAccessor="end"
                eventCellStyle={(event: any) => ({
                    backgroundColor: event.color,
                    borderRadius: 6,
                    padding: 4,
                    opacity: 0.95,
                    borderLeftWidth: 4,
                    borderLeftColor: "rgba(0,0,0,0.2)", // Petit effet de relief élégant sur le côté
                })}
                scrollOffsetMinutes={minHourStart} // Positionne le scroll intelligemment selon les données reçues
                showTime={true}
                swipeEnabled={false}
                onPressEvent={(event: any) => 
                    alert(`${event.title}\n⏰ ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${event.description ? `\n\n📝 ${event.description}` : ''}`)
                }
                activeDate={new Date()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        paddingHorizontal: 16,
        paddingVertical: 16,
        color: "#1C1C1E",
    },
});