// src/screens/ProfileScreen.js
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Theme, formatDate, initials } from '../utils/formatters';
import { ScreenHeading } from '../components/ui/ScreenHeading';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { Ionicons } from '@expo/vector-icons';

export function ProfileScreen({ session, data, onLogout }) {
  const user = session.user || {};
  const flat = data?.flat;

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ScreenHeading eyebrow="ACCOUNT" title="My profile" subtitle="Your resident details and preferences." />

      <Card style={styles.profileCard} padding={24} elevated>
        <View style={styles.profileHeader}>
          <Avatar name={user.name} size={80} bgColor={Theme.blue} fontSize={24} />
          <Text style={styles.profileName}>{user.name || 'Resident'}</Text>
          <Text style={styles.profileRole}>{user.role || 'resident'} {flat ? '·' : ''}</Text>
          {user.email && <Text style={styles.profileEmail}>{user.email}</Text>}
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My home</Text>
        <Card style={styles.infoCard} padding={16}>
          {flat ? (
            <>
              <View style={styles.infoRow}>
                <Icon name="home-outline" size={20} color={Theme.blue} containerSize={40} backgroundColor="#eef0f7" />
                <View style={styles.infoCopy}>
                  <Text style={styles.infoLabel}>Flat number</Text>
                  <Text style={styles.infoValue}>{flat.flatNumber}</Text>
                </View>
              </View>
              {flat.wing && (
                <View style={styles.infoRow}>
                  <Icon name="layers-outline" size={20} color={Theme.blue} containerSize={40} backgroundColor="#eef0f7" />
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoLabel}>Wing</Text>
                    <Text style={styles.infoValue}>{flat.wing}</Text>
                  </View>
                </View>
              )}
              {data?.society && (
                <View style={styles.infoRow}>
                  <Icon name="business-outline" size={20} color={Theme.blue} containerSize={40} backgroundColor="#eef0f7" />
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoLabel}>Society</Text>
                    <Text style={styles.infoValue}>{data.society.name}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.noData}>Flat details unavailable</Text>
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card style={styles.infoCard} padding={0}>
          {[
            { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Push and email alerts' },
            { icon: 'shield-checkmark-outline', title: 'Privacy', subtitle: 'Manage data and visibility' },
            { icon: 'language-outline', title: 'Language', subtitle: 'English (India)' },
            { icon: 'moon-outline', title: 'Appearance', subtitle: 'System default' },
          ].map((item) => (
            <TouchableOpacity key={item.title} style={styles.settingRow} onPress={() => {}}>
              <Icon name={item.icon} size={22} color={Theme.blue} containerSize={44} backgroundColor="#eef0f7" />
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={Theme.muted} />
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.infoCard} padding={0}>
          {[
            { icon: 'help-circle-outline', title: 'Help centre', subtitle: 'Get support from society admin' },
            { icon: 'document-text-outline', title: 'Terms of service', subtitle: 'Read our terms and conditions' },
            { icon: 'shield-outline', title: 'Privacy policy', subtitle: 'How we protect your data' },
          ].map((item) => (
            <TouchableOpacity key={item.title} style={styles.settingRow} onPress={() => {}}>
              <Icon name={item.icon} size={22} color={Theme.blue} containerSize={44} backgroundColor="#eef0f7" />
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={Theme.muted} />
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>SocietyOS Resident v0.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileName: {
    color: Theme.ink,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  profileRole: {
    color: Theme.muted,
    fontSize: 13,
    marginTop: 4,
  },
  profileEmail: {
    color: Theme.muted,
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Theme.ink,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.line,
  },
  infoCopy: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    color: Theme.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    color: Theme.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  noData: {
    color: Theme.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.line,
  },
  settingCopy: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    color: Theme.ink,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: Theme.muted,
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: Theme.rose,
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    color: Theme.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
  },
});
