import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithGithub } = useAuth();
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, colorScheme === 'dark' ? '#444' : '#ccc');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGithub();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with GitHub. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View
            style={[
              styles.logoPlaceholder,
              { borderColor },
            ]}
          >
            <ThemedText style={styles.logoText}>📚</ThemedText>
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.textSection}>
          <ThemedText type="title" style={styles.title}>
            Welcome to EduManage
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to manage your educational journey
          </ThemedText>
        </View>

        {/* Sign In Buttons */}
        <View style={styles.buttonsSection}>
          <Button
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            style={[styles.socialButton, styles.googleButton]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ThemedText style={styles.buttonIcon}>🔍</ThemedText>
                <ThemedText style={styles.buttonText}>Sign in with Google</ThemedText>
              </>
            )}
          </Button>

          <Button
            onPress={handleGithubSignIn}
            disabled={isLoading}
            style={[styles.socialButton, styles.githubButton]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ThemedText style={styles.buttonIcon}>🐙</ThemedText>
                <ThemedText style={styles.buttonText}>Sign in with GitHub</ThemedText>
              </>
            )}
          </Button>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
          <ThemedText style={styles.dividerText}>or</ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
        </View>

        {/* Info Text */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.infoText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
  },
  textSection: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsSection: {
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  githubButton: {
    backgroundColor: '#24292E',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    opacity: 0.5,
  },
  infoSection: {
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
