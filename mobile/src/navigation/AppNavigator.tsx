import Ionicons from '@expo/vector-icons/Ionicons';
import {
  NavigationContainer,
  DefaultTheme,
  DrawerActions,
} from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { colors } from '../theme';
import { CalendarScreen } from '../screens/app/CalendarScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { SupportScreen } from '../screens/app/SupportScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import type {
  AppDrawerParamList,
  AuthStackParamList,
  WorkspaceTabParamList,
} from './types';

const authTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.surfaceBorder,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
  },
};

const Stack = createNativeStackNavigator<AuthStackParamList>();
const Drawer = createDrawerNavigator<AppDrawerParamList>();
const Tabs = createBottomTabNavigator<WorkspaceTabParamList>();

function getTabIcon(routeName: keyof WorkspaceTabParamList, focused: boolean) {
  const iconMap: Record<keyof WorkspaceTabParamList, keyof typeof Ionicons.glyphMap> = {
    Calendar: focused ? 'calendar' : 'calendar-outline',
    Dashboard: focused ? 'grid' : 'grid-outline',
    Profile: focused ? 'person' : 'person-outline',
  };

  return iconMap[routeName];
}

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuButton, pressed ? styles.pressed : null]}>
      <Ionicons color={colors.text} name="menu" size={22} />
    </Pressable>
  );
}

function WorkspaceTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ navigation, route }) => ({
        headerLeft: () => (
          <MenuButton onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
        ),
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
        },
        headerTintColor: colors.text,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          height: 66,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            color={color}
            name={getTabIcon(route.name as keyof WorkspaceTabParamList, focused)}
            size={size}
          />
        ),
      })}
    >
      <Tabs.Screen component={DashboardScreen} name="Dashboard" />
      <Tabs.Screen component={CalendarScreen} name="Calendar" />
      <Tabs.Screen component={ProfileScreen} name="Profile" />
    </Tabs.Navigator>
  );
}

function CustomDrawerContent(props: Parameters<typeof DrawerContentScrollView>[0]) {
  const { session, signOut } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>EduManage</Text>
        <Text style={styles.drawerSubtitle}>
          {session?.user.name || session?.user.email || 'Authenticated user'}
        </Text>
      </View>

      <DrawerItemList {...props} />

      <Pressable
        onPress={() => {
          void signOut();
        }}
        style={({ pressed }) => [
          styles.drawerSignOutButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <Ionicons color={colors.text} name="log-out-outline" size={20} />
        <Text style={styles.drawerSignOutText}>Sign out</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

function AuthenticatedDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveBackgroundColor: colors.surfaceMuted,
        drawerActiveTintColor: colors.text,
        drawerInactiveTintColor: colors.textMuted,
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 290,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
        },
        headerTintColor: colors.text,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Drawer.Screen
        component={WorkspaceTabs}
        name="Workspace"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="albums-outline" size={size} />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        component={SettingsScreen}
        name="Settings"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="settings-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        component={SupportScreen}
        name="Support"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="help-circle-outline" size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export function AppNavigator() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons color={colors.primary} name="school-outline" size={32} />
        <Text style={styles.loadingText}>Preparing EduManage Mobile...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={authTheme}>
      {session ? (
        <AuthenticatedDrawer />
      ) : (
        <Stack.Navigator
          screenOptions={{
            contentStyle: {
              backgroundColor: colors.background,
            },
            headerShown: false,
          }}
        >
          <Stack.Screen component={SignInScreen} name="SignIn" />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingBottom: 24,
  },
  drawerHeader: {
    borderBottomColor: colors.surfaceBorder,
    borderBottomWidth: 1,
    gap: 6,
    marginBottom: 8,
    marginHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  drawerSignOutButton: {
    alignItems: 'center',
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  drawerSignOutText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  drawerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  drawerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    marginLeft: 4,
    padding: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
