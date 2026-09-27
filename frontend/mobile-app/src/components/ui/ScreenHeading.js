// src/components/ui/ScreenHeading.js
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function ScreenHeading({ eyebrow, title, subtitle, style }) {
  return (
    <View style={[styles.container, style]}>
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  eyebrow: {
    color: Theme.muted,
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  title: {
    color: Theme.ink,
    fontSize: 29,
    fontWeight: '700',
    marginTop: eyebrow ? 6 : 0,
  },
  subtitle: {
    color: Theme.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
});
