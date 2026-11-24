import api from "./api";

/** Envoie l'e-mail « mot de passe oublié ». La réponse est la même que le compte existe ou non. */
export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post("/forgot-password", { email: email.trim().toLowerCase() });
};

/** Supprime définitivement le compte connecté. Le mot de passe est redemandé par l'API. */
export const deleteMyAccount = async (password: string): Promise<void> => {
  await api.delete("/me", { data: { password } });
};

export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** Modifie le profil du membre connecté. Seuls les champs envoyés sont modifiés. */
export const updateMyProfile = async (
  changes: Partial<Pick<MemberProfile, "firstName" | "lastName" | "email">>
): Promise<MemberProfile> => {
  const response = await api.patch("/member/me", changes);
  return response.data.data;
};
