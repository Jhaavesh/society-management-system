// src/components/ui/Button.js
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function Button({ title, onPress, disabled = false, style, textStyle, variant = 'primary', loading = false, icon, iconRight = false }) {
  const baseStyles = styles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[baseStyles.container, isDisabled && baseStyles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <Text style={[baseStyles.loadingText, textStyle]}>Loading...</Text>
      ) : (
        <>
          {icon && !iconRight && <Text style={baseStyles.icon}>{icon}</Text>}
          <Text style={[baseStyles.text, textStyle]}>{title}</Text>
          {icon && iconRight && <Text style={baseStyles.icon}>{icon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    container: {
      backgroundColor: Theme.blue,
      borderRadius: 11,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    disabled: { opacity: 0.65 },
    text: { color: '#fff', fontSize: 14, fontWeight: '700' },
    icon: { color: '#fff', fontSize: 17 },
    loadingText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  },
  secondary: {
    container: {
      backgroundColor: Theme.ink,
      borderRadius: 11,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    disabled: { opacity: 0.65 },
    text: { color: '#fff', fontSize: 14, fontWeight: '700' },
    icon: { color: '#fff', fontSize: 17 },
    loadingText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  },
  outline: {
    container: {
      borderWidth: 1,
      borderColor: Theme.line,
      backgroundColor: '#fff',
      borderRadius: 11,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    disabled: { opacity: 0.5, borderColor: Theme.muted },
    text: { color: Theme.ink, fontSize: 14, fontWeight: '700' },
    icon: { color: Theme.blue, fontSize: 17 },
    loadingText: { color: Theme.muted, fontSize: 14, fontWeight: '700' },
  },
});
