import { getItem, setItem, removeItem } from './storage';
const TOKEN_KEY = 'auth_token';
export async function getToken() {
    return await getItem(TOKEN_KEY);
}
export async function setToken(token) {
    await setItem(TOKEN_KEY, token);
}
export async function clearToken() {
    await removeItem(TOKEN_KEY);
}
