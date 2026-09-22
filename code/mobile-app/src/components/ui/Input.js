// src/components/ui/Input.js
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#a6adbb',
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines,
  error,
  style,
  inputStyle,
  labelStyle,
  autoCapitalize = 'sentences',
  autoCompleteType,
}) {
  return (
    <View style={style}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize}
        autoCompleteType={autoCompleteType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Theme.ink,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Theme.ink,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: Theme.rose,
  },
  errorText: {
    color: Theme.rose,
    fontSize: 11,
    marginTop: 4,
  },
});
