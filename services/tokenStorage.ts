import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "user_auth_token";

export const tokenStorage = {
  async saveToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  async getToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },
  async clearToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};