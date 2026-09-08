import { Text } from 'react-native';

import { InfoCard } from '../../components/InfoCard';
import { ScreenLayout } from '../../components/ScreenLayout';
import { colors } from '../../theme';

export function SupportScreen() {
  return (
    <ScreenLayout
      subtitle="A secondary drawer destination for cross-functional support and rollout notes."
      title="Support"
    >
      <InfoCard eyebrow="Rollout" title="What this shell includes">
        <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22 }}>
          This mobile app now separates signed-out and signed-in routes, stores
          Auth0 sessions securely, and combines a drawer menu with bottom-tab
          workspace navigation.
        </Text>
      </InfoCard>
    </ScreenLayout>
  );
}
