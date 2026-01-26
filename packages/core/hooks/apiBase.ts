// sanity-fix: Minimal stub for apiFetch to make @parel/core independent of web app
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  if (typeof window === 'undefined') {
    throw new Error('apiFetch is only available in browser');
  }
  return fetch(url, options);
}

