import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack, HStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Not authenticated</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VStack space="lg" style={styles.content}>
        <Heading size="2xl">Welcome to Bandemoon!</Heading>
        
        <VStack space="md" style={styles.userInfo}>
          <Heading size="lg">User Information</Heading>
          <Text style={styles.text}>Name: {user.firstName} {user.lastName}</Text>
          <Text style={styles.text}>Email: {user.email}</Text>
          <Text style={styles.text}>User ID: {user.id}</Text>
        </VStack>

        <VStack space="md" style={styles.actions}>
          <Button onPress={() => {}}>
            <ButtonText>View Profile</ButtonText>
          </Button>
          
          <Button onPress={() => {}}>
            <ButtonText>Find Musicians</ButtonText>
          </Button>
          
          <Button onPress={() => {}}>
            <ButtonText>My Projects</ButtonText>
          </Button>
          
          <Button variant="outline" onPress={handleLogout}>
            <ButtonText>Logout</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    marginTop: 20,
  },
}); 