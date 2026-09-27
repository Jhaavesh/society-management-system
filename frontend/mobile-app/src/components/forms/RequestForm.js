// src/components/forms/RequestForm.js
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Ionicons } from '@expo/vector-icons';

export function RequestForm({ kind, onSubmit, busy = false, message }) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');

  const handleSubmit = async () => {
    if (!title || !detail) return;
    await onSubmit(title, detail);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Input
          label={kind === 'complaint' ? 'Category' : 'Visitor name'}
          value={title}
          onChangeText={setTitle}
          placeholder={kind === 'complaint' ? 'Plumbing, security...' : 'Guest name'}
          placeholderTextColor="#a6adbb"
        />
        <Input
          label={kind === 'complaint' ? 'What needs attention?' : 'Mobile number'}
          value={detail}
          onChangeText={setDetail}
          placeholder={kind === 'complaint' ? 'Describe the issue' : '10 digit mobile number'}
          placeholderTextColor="#a6adbb"
          keyboardType={kind === 'visitor' ? 'phone-pad' : 'default'}
          multiline={kind === 'complaint'}
          numberOfLines={kind === 'complaint' ? 4 : 1}
        />
      </View>

      <Button
        title={kind === 'complaint' ? 'Submit complaint' : 'Send visitor request'}
        onPress={handleSubmit}
        disabled={busy || !title || !detail}
        loading={busy}
        iconRight
      >
        <Ionicons name="arrow-forward" size={17} color="#fff" />
      </Button>

      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.line,
  },
  inputGroup: {
    marginBottom: 16,
  },
  message: {
    color: Theme.muted,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
