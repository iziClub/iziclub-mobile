import axios from "axios";

const api = axios.create({
  baseURL: "https://api.iziclub.fr/api/v1/",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer oat_Mg.akRTY2ZUNWJwRE1kcFZuRkxjSjZpUFZBZHBZS3VTQUtYM2t3Q3pMWDE2ODQxNTEyODI",
  },
});

// src/api/client.ts

api.interceptors.request.use((config) => {
  console.log("➡️ REQUEST:");
  console.log("URL:", config.url);
  console.log("METHOD:", config.method);
  console.log("PARAMS:", config.params);
  // console.log("HEADERS:", config.headers);
  // // console.log("DATA:", config.data);
  // console.log("CONFIG:", config);

  return config;
});

// api.interceptors.response.use((response) => {
//   console.log("✅ RESPONSE:");
//   console.log("URL:", response.config.url);
//   console.log("STATUS:", response.status);
//   console.log("DATA:", response.data);
//   return response;
// });


export default api;