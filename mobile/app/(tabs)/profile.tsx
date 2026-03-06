import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  
  const colorScheme = useColorScheme();
  const borderColor = useThemeColor(
    { light: '#e5e5e5', dark: '#444' },
    'background'
  );
  const backgroundColor = useThemeColor(
    { light: '#f9f9f9', dark: '#1a1a1a' },
    'background'
  );

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut();
          } catch (_error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={[styles.userCard, { backgroundColor }]}>
            <View style={styles.avatarPlaceholder}>
              {user?.picture ? (
                <Image
                  source={{ uri: user.picture }}
                  style={styles.avatarImage}
                />
              ) : (
                <ThemedText style={styles.avatarText}>👤</ThemedText>
              )}
            </View>
            <View style={styles.userInfo}>
              <ThemedText type="subtitle" style={styles.userName}>
                {user?.name || 'User'}
              </ThemedText>
              <ThemedText style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>

          <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.settingLabel}>Theme</ThemedText>
            <ThemedText style={styles.settingValue}>
              {colorScheme === 'dark' ? 'Dark' : 'Light'}
            </ThemedText>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Version</ThemedText>
            <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>

          <Button
            onPress={handleSignOut}
            style={[styles.button, styles.signOutButton]}
          >
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </Button>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            EduManage v1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4FE',
  },
  avatarText: {
    fontSize: 32,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.6,
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  signOutButton: {
    backgroundColor: '#FF4444',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
