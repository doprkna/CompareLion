import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { getToken } from '@/utils/auth';

export default function Index() {
  useEffect(() => {
    // Check auth on mount
  }, []);

  // Redirect to login if no token, otherwise to feed
  return <Redirect href="/login" />;
}

