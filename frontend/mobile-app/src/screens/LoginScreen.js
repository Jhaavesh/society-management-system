// src/screens/LoginScreen.js
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Theme } from '../utils/formatters';
import { LoginForm } from '../components/forms/LoginForm';

export function LoginScreen({ onLogin }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LoginForm onLogin={onLogin} onPreview={() => onLogin({ preview: true, user: { name: 'Preview Resident' } })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.navy,
  },
});
