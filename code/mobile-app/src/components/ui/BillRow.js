// src/components/ui/BillRow.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../utils/formatters';

export function BillRow({ month, amount, status, tone = 'pending', style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name="receipt-outline" size={18} color={Theme.blue} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{month}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      <Text style={[styles.status, tone === 'paid' && styles.paid, tone === 'overdue' && styles.overdue]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.line,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eef0f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
  },
  label: {
    color: Theme.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  amount: {
    color: Theme.muted,
    fontSize: 12,
    marginTop: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    color: Theme.muted,
    backgroundColor: Theme.line,
  },
  paid: {
    color: Theme.mint,
    backgroundColor: Theme.mint + '20',
  },
  overdue: {
    color: Theme.rose,
    backgroundColor: Theme.rose + '20',
  },
});
