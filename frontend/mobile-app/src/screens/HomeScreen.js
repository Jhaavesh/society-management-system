// src/screens/HomeScreen.js
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Theme, formatAmount, formatDate, initials } from '../utils/formatters';
import { ScreenHeading } from '../components/ui/ScreenHeading';
import { SectionHead } from '../components/ui/SectionHead';
import { QuickAction } from '../components/ui/QuickAction';
import { BillRow } from '../components/ui/BillRow';
import { Icon } from '../components/ui/Icon';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen({ data, onNavigate }) {
  const flat = data?.flat;
  const due = data?.bills?.find((bill) => bill.status !== 'paid');
  const latestNotice = data?.notices?.[0];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.welcome}>
        <View>
          <Text style={styles.welcomeKicker}>YOUR HOME</Text>
          <Text style={styles.welcomeTitle}>{flat?.flatNumber || 'Your flat'}</Text>
          <Text style={styles.welcomeText}>{flat ? flat.wing + ' \u00B7 Resident home' : 'Sign in to load your flat'}</Text>
          <Text style={styles.mutedLight}>{data ? 'Live data synced' : 'Preview mode'}</Text>
        </View>
        <Icon name="home" size={42} color="#cfd4ff" />
      </View>

      <SectionHead title="This month" action="See bills" onPress={() => onNavigate('Bills')} />

      <View style={styles.billCard}>
        <View style={styles.billIcon}>
          <Ionicons name="card-outline" size={20} color={Theme.blue} />
        </View>
        <View style={styles.billCopy}>
          <Text style={styles.cardLabel}>Maintenance bill</Text>
          <Text style={styles.billAmount}>{formatAmount(due)}</Text>
          <Text style={styles.muted}>{due ? 'Due ' + due.month + '/' + due.year : 'No pending bill'}</Text>
        </View>
        <View style={styles.pending}>
          <Text style={[styles.pendingText, due ? styles.pendingActive : styles.pendingClear]}>{due ? 'Pending' : 'Clear'}</Text>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickAction icon="chatbubble-ellipses-outline" label="Raise complaint" color={Theme.rose} onPress={() => onNavigate('Requests')} />
        <QuickAction icon="person-add-outline" label="Add visitor" color={Theme.mint} onPress={() => onNavigate('Requests')} />
        <QuickAction icon="document-text-outline" label="View notices" color={Theme.amber} onPress={() => onNavigate('Notices')} />
        <QuickAction icon="car-outline" label="Parking" color={Theme.blue} onPress={() => onNavigate('Profile')} />
      </View>

      <SectionHead title="Latest notice" action="View all" onPress={() => onNavigate('Notices')} />

      <View style={styles.noticeCard}>
        <View style={styles.noticeMark}>
          <Ionicons name="megaphone-outline" size={18} color={Theme.blue} />
        </View>
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>{latestNotice?.title || 'No notices yet'}</Text>
          <Text style={styles.muted}>{latestNotice ? formatDate(latestNotice.createdAt) : 'Your society notices will appear here'}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={18} color={Theme.muted} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  welcome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeKicker: {
    color: '#8f9cbd',
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 5,
  },
  welcomeText: {
    color: '#aeb9d3',
    fontSize: 13,
    marginTop: 4,
  },
  mutedLight: {
    color: '#8f9cbd',
    fontSize: 11,
    marginTop: 6,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.line,
    marginBottom: 24,
  },
  billIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef0f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billCopy: {
    flex: 1,
  },
  cardLabel: {
    color: Theme.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  billAmount: {
    color: Theme.ink,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  muted: {
    color: Theme.muted,
    fontSize: 12,
    marginTop: 2,
  },
  pending: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pendingActive: {
    color: Theme.amber,
    backgroundColor: Theme.amber + '20',
  },
  pendingClear: {
    color: Theme.mint,
    backgroundColor: Theme.mint + '20',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  noticeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Theme.line,
  },
  noticeMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef0f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    color: Theme.ink,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});
