import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

interface ScreenLayoutProps {
  children: ReactNode;
  subtitle: string;
  title: string;
}

export function ScreenLayout({
  children,
  subtitle,
  title,
}: ScreenLayoutProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={styles.screen}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 16,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    gap: 6,
    marginBottom: 24,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
});
