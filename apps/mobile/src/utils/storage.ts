import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
  }
}

// JSON-safe wrappers
export async function getJSON<T>(key: string): Promise<T | null> {
  const value = await getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error parsing JSON for ${key}:`, error);
    return null;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error stringifying JSON for ${key}:`, error);
  }
}

