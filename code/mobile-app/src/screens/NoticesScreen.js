// src/screens/NoticesScreen.js
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme, formatDate } from '../utils/formatters';
import { ScreenHeading } from '../components/ui/ScreenHeading';
import { Card } from '../components/ui/Card';

export function NoticesScreen({ data }) {
  const notices = data?.notices || [];
  const fallbackNotices = [{ _id: 'preview', title: 'No live notices yet', content: 'Your society announcements will appear here.', createdAt: new Date().toISOString() }];

  const displayNotices = notices.length ? notices : fallbackNotices;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ScreenHeading eyebrow="COMMUNITY" title="Notices" subtitle="Stay in the loop with your society." />

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filter, styles.filterActive]}><Text style={styles.filterText}>All notices</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filter}><Text style={styles.filterText}>Events</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filter}><Text style={styles.filterText}>Maintenance</Text></TouchableOpacity>
      </View>

      {displayNotices.map((notice) => (
        <Card key={notice._id} style={styles.noticeCard} padding={16}>
          <View style={styles.noticeTop}>
            <Text style={styles.noticeTag}>Society notice</Text>
            <Text style={styles.muted}>{formatDate(notice.createdAt)}</Text>
          </View>
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeBody}>{notice.content}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Theme.line,
  },
  filterActive: {
    backgroundColor: Theme.blue,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.muted,
  },
  noticeCard: {
    marginBottom: 12,
  },
  noticeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noticeTag: {
    color: Theme.blue,
    fontSize: 11,
    fontWeight: '700',
  },
  muted: {
    color: Theme.muted,
    fontSize: 11,
  },
  noticeTitle: {
    color: Theme.ink,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  noticeBody: {
    color: Theme.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
