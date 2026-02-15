import api from "./api";

export async function loginUser(email: string, password: string) {
  const response = await api.post("/login", { email, password });
  if (!response.status) throw new Error("Invalid credentials");
  // const response = await fetch("http://localhost:3333/api/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });

  // if (!response.ok) throw new Error("Invalid credentials");

  return response.data();
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const response = await api.post("/register", { name, email, password });
  if (!response.status) throw new Error("Registration failed");
  return response.data();
}