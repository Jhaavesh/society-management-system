// App.js - New entry point with providers
import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TabNavigator } from './src/navigation/TabNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { getResidentData, createComplaint, createVisitor } from './src/services/api';
import { Theme } from './src/types';
import * as SecureStore from 'expo-secure-store';
import { SESSION_KEY } from './src/types';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.canvas },
  loading: { flex: 1, backgroundColor: Theme.navy, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff' },
});

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppContent() {
  const { session, hydrating, login, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const societyId = session?.user?.societyIds?.[0];
    if (!session?.token || !societyId) return;
    getResidentData(session.token, societyId)
      .then(setData)
      .catch((error) => setLoadError(error.message));
  }, [session]);

  const handleLogin = async (newSession: any) => {
    await login(newSession);
  };

  const handleLogout = async () => {
    await logout();
    setData(null);
  };

  const handleSubmitComplaint = async (title: string, detail: string) => {
    const societyId = session?.user?.societyIds?.[0];
    const flatId = session?.user?.flatId;
    if (!session?.token || !societyId || !flatId) throw new Error('Missing session data');
    await createComplaint(session.token, societyId, flatId, title, detail);
    // Refresh data after submission
    const refreshed = await getResidentData(session.token, societyId);
    setData(refreshed);
  };

  const handleSubmitVisitor = async (title: string, detail: string) => {
    const societyId = session?.user?.societyIds?.[0];
    const flatId = session?.user?.flatId;
    if (!session?.token || !societyId || !flatId) throw new Error('Missing session data');
    await createVisitor(session.token, societyId, flatId, title, detail, new Date().toISOString());
    const refreshed = await getResidentData(session.token, societyId);
    setData(refreshed);
  };

  const onNavigate = (tab: string) => {
    // Navigation is handled by tab bar, but can be used for deep linking
  };

  if (hydrating) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading your home...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <TabNavigator
        session={session}
        data={data}
        onNavigate={onNavigate}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}
