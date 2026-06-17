import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider as CustomThemeProvider, useTheme } from "@/src/theme";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {children}
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}

function AppLayout() {
  usePushNotifications();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <CustomThemeProvider>
      <NavigationWrapper>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </NavigationWrapper>
    </CustomThemeProvider>
  );
}


