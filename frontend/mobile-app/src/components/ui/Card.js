// src/components/ui/Card.js
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../utils/formatters';

export function Card({ children, style, padding = 16, bordered = true, elevated = false }) {
  return (
    <View style={[styles.container, bordered && styles.bordered, elevated && styles.elevated, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Theme.line,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
