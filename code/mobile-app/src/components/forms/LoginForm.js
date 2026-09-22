// src/components/forms/LoginForm.js
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Ionicons } from 'react-native';
import { Theme } from '../../utils/formatters';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export function LoginForm({ onLogin, onPreview }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setBusy(true);
    setError('');
    try {
      await onLogin({ preview: true, user: { name: 'Preview Resident' } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="home" size={27} color="#fff" />
        </View>
        <Text style={styles.brandTitle}>SocietyOS</Text>
        <Text style={styles.brandText}>Everything about your society, in one place.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Welcome home</Text>
        <Text style={styles.subtitle}>Sign in with your resident account.</Text>

        <Input
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#a6adbb"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCompleteType="email"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          placeholderTextColor="#a6adbb"
          secureTextEntry
          autoCompleteType="password"
        />

        <Button
          title="Sign in"
          onPress={handleSubmit}
          disabled={busy}
          loading={busy}
          iconRight
        >
          <Ionicons name="arrow-forward" size={17} color="#fff" />
        </Button>

        {error && <Text style={styles.error}>{error}</Text>}

        {onPreview && (
          <TouchableOpacity style={styles.previewButton} onPress={onPreview}>
            <Text style={styles.previewText}>Preview the resident app</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footnote}>Your society administrator manages access.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: Theme.navy,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Theme.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },
  brandTitle: {
    color: '#fff',
    fontSize: 27,
    fontWeight: '700',
  },
  brandText: {
    color: '#aeb9d3',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    color: Theme.ink,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: Theme.muted,
    fontSize: 13,
    marginBottom: 24,
  },
  error: {
    color: Theme.rose,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  previewButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewText: {
    color: Theme.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  footnote: {
    color: '#aeb9d3',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
});
