// src/screens/BillsScreen.js
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Theme, formatAmount, formatDate } from '../utils/formatters';
import { ScreenHeading } from '../components/ui/ScreenHeading';
import { BillRow } from '../components/ui/BillRow';
import { Card } from '../components/ui/Card';

export function BillsScreen({ data }) {
  const bills = data?.bills || [];
  const payments = data?.payments || [];
  const due = bills.find((bill) => bill.status !== 'paid');
  const fallbackBills = [
    { month: 8, year: 2026, amount: 3450, status: 'paid' },
    { month: 7, year: 2026, amount: 3450, status: 'paid' },
  ];

  const displayBills = bills.length ? bills : fallbackBills;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ScreenHeading eyebrow="FINANCE" title="My bills" subtitle="Keep your maintenance payments on track." />

      <Card style={styles.totalCard} padding={20}>
        <Text style={styles.mutedLight}>Total due</Text>
        <Text style={styles.totalAmount}>{formatAmount(due)}</Text>
        <Text style={styles.mutedLight}>{due ? due.month + '/' + due.year : 'No outstanding balance'}</Text>
        <View style={styles.payButton}>
          <Text style={styles.payButtonText}>Online payment gateway pending</Text>
        </View>
      </Card>

      {displayBills.map((bill) => (
        <BillRow
          key={bill._id || bill.month + '-' + bill.year}
          month={bill.month + '/' + bill.year}
          amount={formatAmount(bill)}
          status={bill.status}
          tone={bill.status === 'paid' ? 'paid' : 'pending'}
        />
      ))}

      {payments.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Payment history</Text>
          {payments.map((payment) => (
            <BillRow
              key={payment._id}
              month={formatDate(payment.paymentDate)}
              amount={formatAmount({ amount: payment.amountPaid })}
              status={payment.method || 'Recorded'}
              tone="paid"
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  totalCard: {
    marginBottom: 16,
  },
  mutedLight: {
    color: Theme.muted,
    fontSize: 13,
  },
  totalAmount: {
    color: Theme.ink,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  payButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 11,
    backgroundColor: Theme.line,
    alignItems: 'center',
  },
  payButtonText: {
    color: Theme.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Theme.ink,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
});
