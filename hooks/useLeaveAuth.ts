import { useNavigation, useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Referme tout le parcours de connexion / inscription et revient à l'écran
 * d'où l'utilisateur est parti (page d'un club, profil, accueil...).
 * Si rien n'est ouvert derrière (ouverture directe), on va à l'accueil.
 */
export function useLeaveAuth() {
  const navigation = useNavigation();
  const router = useRouter();

  return useCallback(() => {
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    } else {
      router.replace("/home");
    }
  }, [navigation, router]);
}
