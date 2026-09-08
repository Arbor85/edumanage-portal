import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '../../components/InfoCard';
import { ScreenLayout } from '../../components/ScreenLayout';
import { colors } from '../../theme';

const agenda = [
  { time: '09:00', title: 'Advisor stand-up', detail: 'Review escalations and attendance gaps.' },
  { time: '11:30', title: 'Course planning', detail: 'Confirm next cohort modules and staffing.' },
  { time: '15:00', title: 'Parent outreach', detail: 'Follow up on incomplete enrollment documents.' },
];

export function CalendarScreen() {
  return (
    <ScreenLayout
      subtitle="A dedicated tab for time-based views and upcoming activities."
      title="Calendar"
    >
      <InfoCard eyebrow="Today" title="Upcoming schedule">
        <View style={styles.list}>
          {agenda.map((item) => (
            <View key={`${item.time}-${item.title}`} style={styles.agendaItem}>
              <Text style={styles.time}>{item.time}</Text>
              <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </InfoCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  agendaItem: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  itemDetail: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  time: {
    color: colors.primaryMuted,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 52,
  },
});
