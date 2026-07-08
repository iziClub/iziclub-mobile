import api from "./api";
import { tokenStorage } from "./tokenStorage";

export async function loginUser(email: string, password: string) {
  const response = await api.post("/login", { email, password });
  
  // Axios considère les status 2xx comme réussis, donc response existe. 
  // Ton API renvoie le token dans response.data.data.token
  const authData = response.data?.data;

  if (authData && authData.token) {
    // 🔥 On sauvegarde le token reçu pour que l'intercepteur l'utilise à la prochaine requête
    await tokenStorage.saveToken(authData.token);
  } else {
    throw new Error("Invalid credentials or missing token");
  }

  return authData; // Retourne l'user et le token au cas où ton composant en a besoin (ex: Context)
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const response = await api.post("/member/register", {
    firstName, 
    lastName, 
    email, 
    password,
    passwordConfirmation: password,
  });
  
  return response.data.data;
}

// 💡 Bonus : Fonction de déconnexion pour nettoyer le token
export async function logoutUser() {
  await tokenStorage.clearToken();
}

export async function getCurrentUser() {
  const token = await tokenStorage.getToken();
  if (!token) return null;
  const response = await api.get("/member/me");
  return response.data.data;
}