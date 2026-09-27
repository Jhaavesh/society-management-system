// src/components/ui/Avatar.js
import { View, Text, StyleSheet } from 'react-native';
import { Theme, initials } from '../../utils/formatters';

export function Avatar({ name = 'Resident', size = 38, style, bgColor = Theme.blue, textColor = '#fff', fontSize = 12 }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }, style]}>
      <Text style={[styles.text, { fontSize, color: textColor }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
