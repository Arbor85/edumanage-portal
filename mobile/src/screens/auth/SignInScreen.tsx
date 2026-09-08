import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { getAuth0Config } from '../../auth/config';
import { colors } from '../../theme';

const auth0Config = getAuth0Config();

export function SignInScreen() {
  const { error, isConfigured, isSigningIn, missingConfig, signIn } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.badge}>EduManage Mobile</Text>
        <Text style={styles.title}>Auth0-secured access for your team</Text>
        <Text style={styles.subtitle}>
          Sign in once to open the routed mobile shell, use the drawer, and move
          between dashboard, calendar, and profile tabs.
        </Text>

        <Pressable
          disabled={!isConfigured || isSigningIn}
          onPress={() => {
            void signIn();
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            (!isConfigured || isSigningIn) && styles.disabledButton,
            pressed && isConfigured && !isSigningIn ? styles.primaryButtonPressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isSigningIn ? 'Opening Auth0...' : 'Sign in with Auth0'}
          </Text>
        </Pressable>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Redirect URI</Text>
          <Text style={styles.metaValue}>{auth0Config.redirectUri}</Text>
        </View>

        {!isConfigured ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Auth0 needs configuration</Text>
            <Text style={styles.warningBody}>
              Add these Expo public variables to your local env file:
            </Text>
            <Text style={styles.codeText}>{missingConfig.join('\n')}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Authentication error</Text>
            <Text style={styles.errorBody}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    color: colors.primaryMuted,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.55,
  },
  errorBody: {
    color: colors.primaryMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#4c1522',
    borderColor: '#7f1d1d',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  errorTitle: {
    color: '#fecdd3',
    fontSize: 16,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderRadius: 24,
    borderWidth: 1,
    gap: 18,
    padding: 24,
    width: '100%',
  },
  metaCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    gap: 8,
    padding: 16,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.text,
    fontSize: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#081223',
    fontSize: 16,
    fontWeight: '700',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  warningBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#332208',
    borderColor: '#854d0e',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  warningTitle: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '700',
  },
});
