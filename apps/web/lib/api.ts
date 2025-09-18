const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${base}${path}`, { cache: "no-store", ...options });
  return res.json();
}
