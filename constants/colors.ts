/**
 * Palette de couleurs officielle iziClub
 * Rebranding 2026 - Conforme à la charte graphique et au site iziclub.fr
 */

export const Colors = {
  // --- Couleurs Principales ---
  /** Noir chaud (#161316) - Textes, logos, boutons primaires */
  noir: '#161316',
  /** Fond clair (#EDF2F4) - Arrière-plan principal */
  fond: '#EDF2F4',
  /** Blanc (#FFFFFF) - Cartes, fonds d'encarts, modales */
  blanc: '#FFFFFF',
  /** Vert vif (#6FB478) - Accent, formes, succès, clubs/nature */
  vert: '#6FB478',
  /** Bleu iziClub (#2C55A0) - Accent, formes, liens, interactions */
  bleu: '#2C55A0',
  /** Rouge vif (#BE2D38) - Accent, formes, alertes, favoris, urgences */
  rouge: '#BE2D38',

  // --- Couleurs Secondaires ---
  /** Vert clair (#E1F0E3) - Fonds de jauge, badges succès */
  vertClair: '#E1F0E3',
  /** Bleu clair (#DCE4F3) - Fonds doux, badges information */
  bleuClair: '#DCE4F3',
  /** Gris clair (#DDE4E8) - Filets, séparateurs, bordures douces */
  grisClair: '#DDE4E8',
  /** Gris moyen (#9AA5AD) - Textes discrets, placeholders, icônes inactives */
  gris: '#9AA5AD',

  // --- Aliases sémantiques ---
  background: '#EDF2F4',
  card: '#FFFFFF',
  text: '#161316',
  textSecondary: '#9AA5AD',
  textMuted: '#9AA5AD',
  border: '#DDE4E8',
  primary: '#2C55A0',
  success: '#6FB478',
  danger: '#BE2D38',
  warning: '#F59E0B',
  surface: '#FFFFFF',
  tint: '#2C55A0',
  tabIconDefault: '#9AA5AD',
  tabIconSelected: '#2C55A0',
} as const;

export default Colors;
