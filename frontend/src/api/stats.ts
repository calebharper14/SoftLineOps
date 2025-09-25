export async function fetchStats(token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}