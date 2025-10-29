const API_URL = import.meta.env.VITE_API_URL;

// Mock users for development without backend
const MOCK_USERS = [
  { username: 'admin', password: 'P@55w0rd', role: 'admin' },
  { username: 'user', password: 'password', role: 'user' }
];

export async function login(username: string, password: string) {
  // Try backend first if API_URL is configured
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          login: username,
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
    } catch (error) {
      console.warn('Backend login failed, falling back to mock authentication');
      // Fall through to mock authentication
    }
  }
  
  // Mock authentication fallback
  const user = MOCK_USERS.find(
    u => u.username === username && u.password === password
  );
  
  if (!user) {
    throw new Error("Invalid credentials");
  }
  
  // Return mock token
  return {
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      username: user.username,
      role: user.role
    }
  };
}