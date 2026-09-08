import { Pressable, StyleSheet, Text } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { DetailRow } from '../../components/DetailRow';
import { InfoCard } from '../../components/InfoCard';
import { ScreenLayout } from '../../components/ScreenLayout';
import { colors } from '../../theme';

export function ProfileScreen() {
  const { session, signOut } = useAuth();

  return (
    <ScreenLayout
      subtitle="Your Auth0 identity and the local session stored on the device."
      title="Profile"
    >
      <InfoCard eyebrow="User" title={session?.user.name || session?.user.nickname || 'Signed-in member'}>
        <DetailRow label="Email" value={session?.user.email || 'Not shared'} />
        <DetailRow label="Subject" value={session?.user.sub || 'Unavailable'} />
        <DetailRow
          label="Session"
          value={session?.refreshToken ? 'Refreshable session' : 'Access token only'}
        />
      </InfoCard>

      <InfoCard eyebrow="Security" title="Manage this device">
        <Text style={styles.bodyText}>
          Signing out removes the stored session from Secure Store and returns
          you to the Auth0 sign-in screen.
        </Text>

        <Pressable
          onPress={() => {
            void signOut();
          }}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed ? styles.signOutButtonPressed : null,
          ]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </InfoCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 16,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  signOutButtonPressed: {
    opacity: 0.9,
  },
  signOutText: {
    color: '#19050b',
    fontSize: 16,
    fontWeight: '700',
  },
});
