// sanity-fix: Minimal stub for apiFetch to make @parel/core independent of web app
export async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('apiFetch is only available in browser');
  }
  const res = await fetch(url, options);
  return res.json() as Promise<T>;
}










