// TODO: integrate expo-notifications
// TODO: register device with backend (POST /api/mobile/devices)

export async function requestPermissions(): Promise<boolean> {
  // Placeholder: return false for now
  console.log('TODO: Request notification permissions');
  return false;
}

export async function registerDevice(token: string): Promise<void> {
  // Placeholder: no-op
  console.log('TODO: Register device with backend', token);
}

