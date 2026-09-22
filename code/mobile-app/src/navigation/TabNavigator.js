// src/navigation/TabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/formatters';
import { HomeScreen } from '../screens/HomeScreen';
import { BillsScreen } from '../screens/BillsScreen';
import { NoticesScreen } from '../screens/NoticesScreen';
import { RequestsScreen } from '../screens/RequestsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export function TabNavigator({ session, data, onNavigate, onLogout }) {
  const handleSubmitComplaint = async (title, detail) => {
    // API call will be handled by parent or context
  };

  const handleSubmitVisitor = async (title, detail) => {
    // API call will be handled by parent or context
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Theme.blue,
        tabBarInactiveTintColor: '#9ca5b6',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: 'grid',
            Bills: 'card',
            Notices: 'notifications',
            Requests: 'add-circle',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={() => <HomeScreen data={data} onNavigate={onNavigate} />} />
      <Tab.Screen name="Bills" component={() => <BillsScreen data={data} />} />
      <Tab.Screen name="Notices" component={() => <NoticesScreen data={data} />} />
      <Tab.Screen
        name="Requests"
        component={() => (
          <RequestsScreen
            session={session}
            data={data}
            onSubmitComplaint={handleSubmitComplaint}
            onSubmitVisitor={handleSubmitVisitor}
          />
        )}
      />
      <Tab.Screen
        name="Profile"
        component={() => <ProfileScreen session={session} data={data} onLogout={onLogout} />}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Theme.line,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
