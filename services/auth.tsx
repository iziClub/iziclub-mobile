export async function loginUser(email: string, password: string) {
  const response = await fetch("http://localhost:3333/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error("Invalid credentials");

  return response.json();
}
