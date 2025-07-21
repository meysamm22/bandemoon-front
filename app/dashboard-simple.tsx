import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack, HStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { apiService, ProfileResponse } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';

export default function DashboardSimple() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response: ProfileResponse = await apiService.getMyProfile();
      
      if (response.success && response.userProfile) {
        setProfile(response.userProfile);
        console.log('Profile loaded:', response.userProfile);
      } else {
        console.log('Failed to load profile:', response.message);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <VStack space="xl" style={styles.content}>
        {/* Header */}
        <VStack space="md">
          <Heading size="2xl">Welcome to Bandemoon!</Heading>
          <Text>Your Dashboard</Text>
        </VStack>

        {/* Profile Info */}
        {profile && (
          <VStack space="md" style={styles.card}>
            <Heading size="lg">Profile Information</Heading>
            <VStack space="sm">
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{profile.firstName} {profile.lastName}</Text>
              </HStack>
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </HStack>
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>User ID:</Text>
                <Text style={styles.value}>#{profile.id}</Text>
              </HStack>
            </VStack>
          </VStack>
        )}

        {/* Actions */}
        <VStack space="md" style={styles.actions}>
          <Button onPress={() => {}}>
            <ButtonText>Edit Profile</ButtonText>
          </Button>
          
          <Button onPress={() => {}}>
            <ButtonText>Find Musicians</ButtonText>
          </Button>
          
          <Button onPress={() => {}}>
            <ButtonText>My Projects</ButtonText>
          </Button>
          
          <Button variant="outline" onPress={handleLogout} isDisabled={isLoggingOut}>
            <ButtonText>{isLoggingOut ? 'Logging out...' : 'Logout'}</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: 16,
  },
  value: {
    color: '#666',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    marginTop: 20,
  },
}); 