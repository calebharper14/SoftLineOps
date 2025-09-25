const API_URL = import.meta.env.VITE_API_URL;

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      login: username,  // IMPORTANT: Change username to login
      password: password 
    }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    console.error("Login error:", errorData);
    throw new Error(errorData?.message || "Login failed");
  }
  
  return res.json();
}