// src/components/ui/SectionHead.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function SectionHead({ title, action, onPress, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {action && onPress && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Theme.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  action: {
    color: Theme.blue,
    fontSize: 13,
    fontWeight: '600',
  },
});
