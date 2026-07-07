import api from "./api";

export async function loginUser(email: string, password: string) {
  const response = await api.post("/login", { email, password });
  if (!response.status) throw new Error("Invalid credentials");

  return response.data.data;
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  // console.log("Registering user with:", firstName, lastName, email, password);
  const response = await api.post("/member/register", {
    firstName, 
    lastName, 
    email, 
    password,
    passwordConfirmation: password,})
  if (!response.status) throw new Error("Registration failed");
  return response.data.data;
}