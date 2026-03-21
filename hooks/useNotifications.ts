import { useState, useEffect, useRef } from "react";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  registerTokenWithBackend,
  unregisterTokenFromBackend,
} from "@/lib/notifications";
import { useAuth } from "@/context/AuthContext";

const PUSH_TOKEN_KEY = "rivo_push_token";
const PUSH_REGISTERED_KEY = "rivo_push_registered";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    if (!isAuthenticated) {
      // Reset state when user logs out
      setPushEnabled(false);
      initialized.current = false;
      return;
    }

    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      const registered = await AsyncStorage.getItem(PUSH_REGISTERED_KEY);
      if (registered === "true") {
        setPushEnabled(true);
      }
    })();
  }, [isAuthenticated]);

  const togglePush = async (enabled: boolean) => {
    if (enabled) {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token) {
          // Could not get token — check if permission was denied
          const { status } = await Notifications.getPermissionsAsync();
          if (status === "denied") {
            Linking.openSettings();
          }
          return;
        }

        // Got token — save it and register with backend
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        setPushEnabled(true);
        await AsyncStorage.setItem(PUSH_REGISTERED_KEY, "true");

        // Register with backend (don't block on this)
        registerTokenWithBackend(token).catch(() => {});
      } catch (err) {
        console.warn("Push toggle error:", err);
      }
    } else {
      setPushEnabled(false);
      await AsyncStorage.removeItem(PUSH_REGISTERED_KEY);

      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (token) {
        unregisterTokenFromBackend(token).catch(() => {});
      }
    }
  };

  return { pushEnabled, togglePush };
}
