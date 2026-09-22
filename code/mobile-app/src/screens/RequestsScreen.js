// src/screens/RequestsScreen.js
import { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme, formatDate } from '../utils/formatters';
import { ScreenHeading } from '../components/ui/ScreenHeading';
import { SectionHead } from '../components/ui/SectionHead';
import { RequestForm } from '../components/forms/RequestForm';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export function RequestsScreen({ session, data, onSubmitComplaint, onSubmitVisitor }) {
  const [kind, setKind] = useState('complaint');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (title, detail) => {
    setBusy(true);
    setMessage('');
    try {
      if (kind === 'complaint') {
        await onSubmitComplaint(title, detail);
        setMessage('Complaint submitted to your society team.');
      } else {
        await onSubmitVisitor(title, detail);
        setMessage('Visitor request sent to security.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const visitors = data?.visitors || [];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ScreenHeading eyebrow="HELP DESK" title="Requests" subtitle="Raise a complaint or let security know about a visitor." />

      <View style={styles.requestToggle}>
        <TouchableOpacity style={[styles.requestChoice, kind === 'complaint' && styles.requestChoiceActive]} onPress={() => { setKind('complaint'); setMessage(''); }}>
          <Text style={[styles.requestChoiceText, kind === 'complaint' && styles.requestChoiceTextActive]}>Complaint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.requestChoice, kind === 'visitor' && styles.requestChoiceActive]} onPress={() => { setKind('visitor'); setMessage(''); }}>
          <Text style={[styles.requestChoiceText, kind === 'visitor' && styles.requestChoiceTextActive]}>Visitor</Text>
        </TouchableOpacity>
      </View>

      <RequestForm kind={kind} onSubmit={handleSubmit} busy={busy} message={message} />

      <SectionHead title="My visitors" />

      {visitors.length ? (
        visitors.map((visitor) => (
          <Card key={visitor._id} style={styles.visitorCard} padding={16}>
            <View style={styles.visitorTop}>
              <View style={styles.visitorMark}>
                <Ionicons name="person-outline" size={18} color={Theme.blue} />
              </View>
              <View style={styles.visitorCopy}>
                <Text style={styles.visitorName}>{visitor.visitorName}</Text>
                <Text style={styles.muted}>{visitor.visitorMobile}</Text>
              </View>
              <Badge variant={visitor.status === 'approved' ? 'success' : visitor.status === 'pending' ? 'warning' : 'error'} size="small">
                {visitor.status}
              </Badge>
            </View>
            <Text style={styles.visitorDate}>
              <Ionicons name="calendar-outline" size={13} color={Theme.muted} />
              {' '}{formatDate(visitor.visitDate)}
            </Text>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard} padding={24}>
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color={Theme.muted} />
            <Text style={styles.emptyTitle}>No visitors yet</Text>
            <Text style={styles.emptyText}>Visitor requests will appear here once submitted.</Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  requestToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Theme.line,
    marginBottom: 16,
  },
  requestChoice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestChoiceActive: {
    backgroundColor: Theme.blue,
  },
  requestChoiceText: {
    color: Theme.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  requestChoiceTextActive: {
    color: '#fff',
  },
  visitorCard: {
    marginBottom: 12,
  },
  visitorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visitorMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef0f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  visitorCopy: {
    flex: 1,
  },
  visitorName: {
    color: Theme.ink,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  muted: {
    color: Theme.muted,
    fontSize: 12,
  },
  visitorDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 52,
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyTitle: {
    color: Theme.ink,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    color: Theme.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
