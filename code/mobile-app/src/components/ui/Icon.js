// src/components/ui/Icon.js
import { Ionicons } from '@expo/vector-icons';
import { Text, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function Icon({ name, size = 20, color = Theme.blue, style, backgroundColor, containerSize }) {
  if (backgroundColor && containerSize) {
    return (
      <Text style={[styles.iconContainer, { width: containerSize, height: containerSize, borderRadius: containerSize / 2, backgroundColor }, style]}>
        <Ionicons name={name} size={size} color={color} />
      </Text>
    );
  }

  return <Ionicons name={name} size={size} color={color} style={style} />;
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
