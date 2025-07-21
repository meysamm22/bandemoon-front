import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to test dashboard
        router.replace('/dashboard-test');
      } else {
        // User is not authenticated, redirect to signin
        router.replace('/signin');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication state
  return <LoadingScreen message="Checking authentication..." />;
}
