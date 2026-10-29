/**
 * Transition commune des piles d'écrans : la page arrive par la droite,
 * et on revient en arrière en glissant depuis n'importe où sur l'écran (iOS).
 */
export const slideScreenOptions = {
  headerShown: false,
  animation: "slide_from_right",
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
} as const;
