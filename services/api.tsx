import axios from "axios";

const api = axios.create({
  baseURL: "https://api.dev.iziclub.fr/api/v1/",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer oat_Mg.akRTY2ZUNWJwRE1kcFZuRkxjSjZpUFZBZHBZS3VTQUtYM2t3Q3pMWDE2ODQxNTEyODI",
  },
});

api.interceptors.request.use((config) => {
  console.log("➡️ REQUEST:");
  console.log("URL:", config.url);
  console.log("METHOD:", config.method);
  console.log("PARAMS:", config.params);
  // console.log("HEADERS:", config.headers);
  // // console.log("DATA:", config.data);

  return config;
});

export default api;