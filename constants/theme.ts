/**
 * Thème iziClub, commun avec le back-office web.
 * Source : librairie « iziClub Design System » (tokens.json), charte iziclub.fr.
 *
 * Rôles des couleurs :
 * - noir : couleur primaire (CTA, sélection, onglet actif, texte)
 * - bleu / vert / rouge : couleurs tertiaires (formes, illustrations, liens, pastilles)
 *   jamais en fond de bouton, sauf rouge pour une action destructive
 */
import { TextStyle } from "react-native";

export const Colors = {
  // --- Couleurs principales ---
  /** Noir chaud - couleur primaire : textes, logo, CTA, sélection */
  noir: "#161316",
  /** Survol / état pressé du CTA primaire */
  noirSurvol: "#3A353A",
  /** Fond clair - arrière-plan des écrans */
  fond: "#EDF2F4",
  /** Blanc - cartes, champs, modales */
  blanc: "#FFFFFF",
  /** Vert - tertiaire : formes, illustrations, succès. Jamais en texte */
  vert: "#6FB478",
  /** Bleu - tertiaire : formes, illustrations, liens texte, focus */
  bleu: "#2C55A0",
  /** Rouge - tertiaire et sémantique : erreur, action destructive */
  rouge: "#BE2D38",

  // --- Couleurs secondaires ---
  vertFonce: "#4F9A5A",
  bleuFonce: "#1F3F7A",
  /** Fonds de jauge, messages de succès */
  vertClair: "#E1F0E3",
  /** Fonds doux, tag doux, ligne active */
  bleuClair: "#DCE4F3",
  /** Fond des messages d'erreur */
  rougeClair: "#FFE9EB",
  /** Bordures, séparateurs, fond du bouton désactivé */
  grisClair: "#DDE4E8",
  /** Placeholder, icônes inactives, texte du bouton désactivé (jamais pour un texte à lire) */
  gris: "#9AA5AD",
  /** Texte secondaire lisible (adresse, date, sous-titre) - 5,6:1 sur blanc */
  grisTexte: "#5E6A73",

  // --- Alias sémantiques ---
  background: "#EDF2F4",
  card: "#FFFFFF",
  text: "#161316",
  textSecondary: "#5E6A73",
  textMuted: "#9AA5AD",
  border: "#DDE4E8",
  primary: "#161316",
  success: "#6FB478",
  danger: "#BE2D38",
  surface: "#FFFFFF",
  tint: "#161316",
  tabIconDefault: "#9AA5AD",
  tabIconSelected: "#161316",
} as const;

/** Grille de 4 */
export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
} as const;

export const Radius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 28,
  full: 9999,
} as const;

/** Hauteur minimale d'une cible tactile (Apple HIG) */
export const TOUCH_MIN = 44;

/** Polices chargées dans app/_layout.tsx */
export const Fonts = {
  /** Bricolage Grotesque 700 : titres uniquement */
  titre: "BricolageGrotesque_700Bold",
  /** Geist 400 : texte courant */
  regular: "Geist_400Regular",
  /** Geist 500 : libellés, boutons, onglets, tags */
  medium: "Geist_500Medium",
} as const;

/** Échelle typographique commune mobile / web */
export const Typography = {
  titre1: { fontFamily: Fonts.titre, fontSize: 32, lineHeight: 34, letterSpacing: -1.28 },
  titre2: { fontFamily: Fonts.titre, fontSize: 24, lineHeight: 28, letterSpacing: -0.48 },
  titre3: { fontFamily: Fonts.titre, fontSize: 20, lineHeight: 24 },
  texteL: { fontFamily: Fonts.regular, fontSize: 18, lineHeight: 26 },
  texte: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  texteS: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  legende: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

/** Seule ombre autorisée : modales, menus, bottom sheets. Jamais sur une carte posée. */
export const Shadow = {
  flottante: {
    shadowColor: "#161316",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export default Colors;
