// src/components/ui/Badge.js
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function Badge({ children, variant = 'default', size = 'medium', style }) {
  const variantStyles = styles[variant];
  const sizeStyles = size === 'small' ? styles.small : styles.medium;

  return (
    <View style={[styles.base, variantStyles, sizeStyles, style]}>
      <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medium: {
    paddingVertical: 4,
  },
  small: {
    paddingVertical: 2,
  },
  text: {
    fontWeight: '700',
    fontSize: 10,
  },
  default: {
    backgroundColor: Theme.line,
  },
  success: {
    backgroundColor: Theme.mint + '20',
  },
  warning: {
    backgroundColor: Theme.amber + '20',
  },
  error: {
    backgroundColor: Theme.rose + '20',
  },
  info: {
    backgroundColor: Theme.blue + '20',
  },
});
