import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 14,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  value: {
    color: colors.text,
    flex: 1.2,
    fontSize: 14,
    textAlign: 'right',
  },
});
