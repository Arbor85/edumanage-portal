import { Text } from 'react-native';

import { getAuth0Config } from '../../auth/config';
import { DetailRow } from '../../components/DetailRow';
import { InfoCard } from '../../components/InfoCard';
import { ScreenLayout } from '../../components/ScreenLayout';
import { colors } from '../../theme';

const auth0Config = getAuth0Config();

export function SettingsScreen() {
  return (
    <ScreenLayout
      subtitle="Drawer-based settings for app-level configuration and redirect details."
      title="Settings"
    >
      <InfoCard eyebrow="Auth0" title="Native app configuration">
        <DetailRow
          label="Domain"
          value={auth0Config.domain || 'Set EXPO_PUBLIC_AUTH0_DOMAIN'}
        />
        <DetailRow
          label="Client ID"
          value={auth0Config.clientId || 'Set EXPO_PUBLIC_AUTH0_CLIENT_ID'}
        />
        <DetailRow label="Scheme" value={auth0Config.scheme} />
      </InfoCard>

      <InfoCard eyebrow="Redirects" title="Callback URLs">
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          Login: {auth0Config.redirectUri}
        </Text>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          Logout: {auth0Config.logoutRedirectUri}
        </Text>
      </InfoCard>
    </ScreenLayout>
  );
}
