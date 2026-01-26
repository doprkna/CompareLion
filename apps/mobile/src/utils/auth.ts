import { getItem, setItem, removeItem } from './storage';

const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  return await getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await removeItem(TOKEN_KEY);
}

