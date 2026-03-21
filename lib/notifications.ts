import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiFetch } from "./api";

const PROJECT_ID = "514c5ebf-4e3f-47cd-a553-3566c740f91f";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Allow on all real devices — don't check Device.isDevice as it can
  // return false in some preview/standalone builds
  if (Platform.OS === "web") {
    return null;
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00D084",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? PROJECT_ID;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (err) {
    console.warn("Failed to get push token:", err);
    return null;
  }
}

export async function registerTokenWithBackend(token: string): Promise<void> {
  const res = await apiFetch("/agents/push-register/", {
    method: "POST",
    body: JSON.stringify({
      expo_push_token: token,
      platform: Platform.OS,
    }),
  });
  if (!res.ok) throw new Error("Failed to register push token");
}

export async function unregisterTokenFromBackend(token: string): Promise<void> {
  const res = await apiFetch("/agents/push-unregister/", {
    method: "POST",
    body: JSON.stringify({ expo_push_token: token }),
  });
  if (!res.ok) throw new Error("Failed to unregister push token");
}
