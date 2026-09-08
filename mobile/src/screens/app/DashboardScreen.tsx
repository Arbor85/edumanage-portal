import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '../../components/InfoCard';
import { ScreenLayout } from '../../components/ScreenLayout';
import { colors } from '../../theme';

const metrics = [
  { label: 'Active learners', value: '248' },
  { label: 'Pending approvals', value: '12' },
  { label: 'Today meetings', value: '7' },
];

export function DashboardScreen() {
  return (
    <ScreenLayout
      subtitle="A routed home screen that acts as the landing page inside the authenticated workspace."
      title="Dashboard"
    >
      <InfoCard eyebrow="Overview" title="Program health">
        <View style={styles.metricGrid}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </InfoCard>

      <InfoCard eyebrow="Routing" title="Navigation shell">
        <Text style={styles.bodyText}>
          Use the drawer to jump to settings or support, and the bottom tabs to
          stay within your day-to-day workspace.
        </Text>
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
  metricCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    gap: 8,
    minWidth: 110,
    padding: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  metricValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
});
