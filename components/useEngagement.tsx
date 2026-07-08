/**
 * useEngagement.ts
 *
 * Hook central pour gérer les interactions utilisateur :
 * - like (club & event)
 * - save / bookmark (club & event)
 * - participation (event uniquement)
 *
 * ⚠️  Pas d'appels API pour l'instant : état local uniquement.
 *     Remplacer les TODO par tes appels de service quand prêt.
 */

import { useState, useCallback } from "react";
import { likeEvent, unlikeEvent, saveEvent } from "@/services/events.service";
import { likeClub, unlikeClub, saveClub } from "@/services/clubs.service";
// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export type ItemKind = "event" | "club";

export type EngagementItem = {
  id: string;
  kind: ItemKind;
  name: string;
  imageUrl?: string;
  // Event only
  startTime?: string;
  endTime?: string;
  location?: string;
  // Club only
  sport?: string;
};

export type EngagementState = {
  liked: boolean;
  saved: boolean;
  participating: boolean; // event only
  likeCount: number;
};

// ─────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────
export function useEngagement(
  item: EngagementItem,
  initial?: Partial<EngagementState>
) {
  const [state, setState] = useState<EngagementState>({
    liked: initial?.liked ?? false,
    saved: initial?.saved ?? false,
    participating: initial?.participating ?? false,
    likeCount: initial?.likeCount ?? 0,
  });

  const toggleLike = useCallback(async () => {
    const prev = state;
    const next = !prev.liked;
    // TODO: appel API like/unlike
    if (next) {
      await (item.kind === "event" ? likeEvent(item.id) : likeClub(item.id));
      console.log(`Liked ${item.kind} with ID: ${item.id}`);
    } else {
      await (item.kind === "event" ? unlikeEvent(item.id) : unlikeClub(item.id));
    }
    setState({
      ...prev,
      liked: next,
      likeCount: prev.likeCount + (next ? 1 : -1),
    });
  }, [item.id, state]);

  const toggleSave = useCallback(async () => {
    const prev = state;
    const next = !prev.saved;
    // TODO: appel API save/unsave
    if (next) {
      await (item.kind === "event" ? saveEvent(item.id) : saveClub(item.id));
      console.log(`Saved ${item.kind} with ID: ${item.id}`);
    } else {
      // TODO: appel API unsave
    }
    setState({
      ...prev,
      saved: next
    });
  }, [item.id, state]);

  const toggleParticipation = useCallback(() => {
    if (item.kind !== "event") return;
    setState((prev) => {
      const next = !prev.participating;
      // TODO: appel API participate/unparticipate
      return { ...prev, participating: next };
    });
  }, [item.id, item.kind]);

  return { state, toggleLike, toggleSave, toggleParticipation };
}

// ─────────────────────────────────────────────────────────
// Store global simulé pour la page Profil
// (En prod : remplacer par un vrai store / cache API)
// ─────────────────────────────────────────────────────────
export type ProfileEngagements = {
  liked: EngagementItem[];
  saved: EngagementItem[];
  participating: EngagementItem[]; // events uniquement
};

/** Données mockées pour la démo du profil */
export const MOCK_PROFILE_ENGAGEMENTS: ProfileEngagements = {
  liked: [
    {
      id: "c1",
      kind: "club",
      name: "Club Sportif de Gravelotte",
      imageUrl: "https://picsum.photos/seed/club1/200",
      sport: "Football",
    },
    {
      id: "e1",
      kind: "event",
      name: "Coupe de Moselle – CSG vs Talange",
      imageUrl: "https://picsum.photos/seed/evt1/200",
      startTime: "2026-06-14T14:00:00",
      location: "Gravelotte, Rue du Stade",
    },
    {
      id: "c2",
      kind: "club",
      name: "AS Saint-Julien-lès-Metz",
      imageUrl: "https://picsum.photos/seed/club2/200",
      sport: "Basketball",
    },
  ],
  saved: [
    {
      id: "e2",
      kind: "event",
      name: "Tournoi U18 – Grand Est",
      imageUrl: "https://picsum.photos/seed/evt2/200",
      startTime: "2026-07-03T09:00:00",
      endTime: "2026-07-03T18:00:00",
      location: "Metz, Palais des Sports",
    },
    {
      id: "c1",
      kind: "club",
      name: "Club Sportif de Gravelotte",
      imageUrl: "https://picsum.photos/seed/club1/200",
      sport: "Football",
    },
    {
      id: "e3",
      kind: "event",
      name: "Match amical – FC Metz Academy",
      imageUrl: "https://picsum.photos/seed/evt3/200",
      startTime: "2026-06-28T10:30:00",
      location: "Metz, Stade Saint-Symphorien",
    },
  ],
  participating: [
    {
      id: "e1",
      kind: "event",
      name: "Coupe de Moselle – CSG vs Talange",
      imageUrl: "https://picsum.photos/seed/evt1/200",
      startTime: "2026-06-14T14:00:00",
      endTime: "2026-06-14T16:30:00",
      location: "Gravelotte, Rue du Stade",
    },
    {
      id: "e4",
      kind: "event",
      name: "Journée Portes Ouvertes – CSG",
      imageUrl: "https://picsum.photos/seed/evt4/200",
      startTime: "2026-09-06T10:00:00",
      endTime: "2026-09-06T17:00:00",
      location: "Gravelotte",
    },
  ],
};