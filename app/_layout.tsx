import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ConfigProvider } from "@/context/ConfigContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

const MAX_APP_WIDTH = 480;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width <= MAX_APP_WIDTH) {
    return <>{children}</>;
  }
  return (
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", backgroundColor: "#000000" }}>
      <View style={{ flex: 1, maxWidth: MAX_APP_WIDTH }}>
        {children}
      </View>
    </View>
  );
}

function NotificationListener() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "referral_signup") router.push("/(tabs)/network");
        else if (data?.type === "referral_bonus") router.push("/referral-bonus");
        else if (data?.type === "deal_disbursed") router.push("/(tabs)/clients");
        else if (data?.type === "status_update") router.push("/(tabs)/clients");
      },
    );
    return () => subscription.remove();
  }, []);

  return null;
}

function NavGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === "(tabs)";
    const onLanding = segments.length === 0 || segments[0] === "index";

    if (!isAuthenticated && inTabs) {
      router.replace("/");
    } else if (isAuthenticated && onLanding) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <NavGuard />
      <NotificationListener />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="whatsapp-listening" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="submit-lead" options={{ presentation: "card" }} />
        <Stack.Screen name="referral-success" options={{ presentation: "card", gestureEnabled: false }} />
        <Stack.Screen name="referral-bonus" options={{ presentation: "card", gestureEnabled: false }} />
        <Stack.Screen name="referral-info" options={{ presentation: "card" }} />
        <Stack.Screen name="terms" options={{ presentation: "card" }} />
        <Stack.Screen name="privacy" options={{ presentation: "card" }} />
        <Stack.Screen name="bonus-terms" options={{ presentation: "card" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ConfigProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <StatusBar style="light" />
                  <ResponsiveContainer>
                    <RootLayoutNav />
                  </ResponsiveContainer>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </ConfigProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
