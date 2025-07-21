import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack, HStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { apiService, ProfileResponse } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  website?: string;
  socialMediaLinks?: string;
  musicalInstruments?: string;
  musicalGenres?: string;
  experienceLevel?: string;
  availability?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardNew() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      } else {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="accent" action="error">
              <ToastTitle>{response.message || 'Failed to load profile'}</ToastTitle>
            </Toast>
          ),
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="accent" action="error">
            <ToastTitle>Network error. Please try again.</ToastTitle>
          </Toast>
        ),
      });
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
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="accent" action="error">
            <ToastTitle>Logout failed. Please try again.</ToastTitle>
          </Toast>
        ),
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <VStack space="lg" style={styles.content}>
          <Heading size="2xl">Dashboard</Heading>
          <Text>Failed to load profile data.</Text>
          <Button onPress={loadUserProfile}>
            <ButtonText>Retry</ButtonText>
          </Button>
        </VStack>
      </View>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <VStack space="xl" style={styles.content}>
        {/* Header */}
        <VStack space="md">
          <HStack style={styles.header} space="md">
            <Avatar size="xl">
              {profile.profilePicture ? (
                <AvatarImage source={{ uri: profile.profilePicture }} />
              ) : (
                <AvatarFallbackText>{getInitials(profile.firstName, profile.lastName)}</AvatarFallbackText>
              )}
            </Avatar>
            <VStack space="sm" style={styles.headerText}>
              <Heading size="xl">{profile.firstName} {profile.lastName}</Heading>
              <Text style={styles.email}>{profile.email}</Text>
              <Badge variant="outline">
                <BadgeText>Member since {new Date(profile.createdAt).getFullYear()}</BadgeText>
              </Badge>
            </VStack>
          </HStack>
        </VStack>

        <Divider />

        {/* Profile Information */}
        <Card style={styles.card}>
          <VStack space="md" style={styles.cardContent}>
            <Heading size="lg">Profile Information</Heading>
            <VStack space="md">
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>{profile.firstName} {profile.lastName}</Text>
              </HStack>
              
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </HStack>
              
              {profile.phoneNumber && (
                <HStack style={styles.infoRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{profile.phoneNumber}</Text>
                </HStack>
              )}
              
              {profile.location && (
                <HStack style={styles.infoRow}>
                  <Text style={styles.label}>Location:</Text>
                  <Text style={styles.value}>{profile.location}</Text>
                </HStack>
              )}
              
              {profile.bio && (
                <VStack space="sm">
                  <Text style={styles.label}>Bio:</Text>
                  <Text style={styles.value}>{profile.bio}</Text>
                </VStack>
              )}
            </VStack>
          </VStack>
        </Card>

        {/* Musical Information */}
        <Card style={styles.card}>
          <VStack space="md" style={styles.cardContent}>
            <Heading size="lg">Musical Information</Heading>
            <VStack space="md">
              {profile.musicalInstruments && (
                <VStack space="sm">
                  <Text style={styles.label}>Instruments:</Text>
                  <Text style={styles.value}>{profile.musicalInstruments}</Text>
                </VStack>
              )}
              
              {profile.musicalGenres && (
                <VStack space="sm">
                  <Text style={styles.label}>Genres:</Text>
                  <Text style={styles.value}>{profile.musicalGenres}</Text>
                </VStack>
              )}
              
              {profile.experienceLevel && (
                <HStack style={styles.infoRow}>
                  <Text style={styles.label}>Experience:</Text>
                  <Text style={styles.value}>{profile.experienceLevel}</Text>
                </HStack>
              )}
              
              {profile.availability && (
                <VStack space="sm">
                  <Text style={styles.label}>Availability:</Text>
                  <Text style={styles.value}>{profile.availability}</Text>
                </VStack>
              )}
            </VStack>
          </VStack>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <VStack space="md" style={styles.cardContent}>
            <Heading size="lg">Account Information</Heading>
            <VStack space="md">
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>User ID:</Text>
                <Text style={styles.value}>#{profile.id}</Text>
              </HStack>
              
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>Joined:</Text>
                <Text style={styles.value}>{new Date(profile.createdAt).toLocaleDateString()}</Text>
              </HStack>
              
              <HStack style={styles.infoRow}>
                <Text style={styles.label}>Last Updated:</Text>
                <Text style={styles.value}>{new Date(profile.updatedAt).toLocaleDateString()}</Text>
              </HStack>
            </VStack>
          </VStack>
        </Card>

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
  header: {
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  email: {
    color: '#666',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
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
  cardContent: {
    padding: 20,
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