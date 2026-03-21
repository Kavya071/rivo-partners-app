import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { updateProfile } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || "";

/**
 * Catches OAuth redirect from Microsoft/Outlook.
 * rivopartners://auth?code=XXX lands here.
 *
 * For mobile (public client), we exchange the code directly
 * without client_secret, then save the email via updateProfile.
 */
export default function AuthRedirectScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Connecting Outlook...");

  useEffect(() => {
    const handleCode = async () => {
      let code = params.code;

      if (!code) {
        try {
          const url = await Linking.getInitialURL();
          if (url) {
            const urlObj = new URL(url);
            code = urlObj.searchParams.get("code") || undefined;
          }
        } catch {}
      }

      if (!code) {
        setStatus("No auth code received");
        setTimeout(() => router.replace("/(tabs)/profile"), 1000);
        return;
      }

      try {
        setStatus("Exchanging token...");
        const redirectUri = "rivopartners://auth";

        // Exchange code for token directly (public client — no client_secret)
        const tokenRes = await fetch(
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: [
              `client_id=${MICROSOFT_CLIENT_ID}`,
              `code=${code}`,
              `redirect_uri=${encodeURIComponent(redirectUri)}`,
              `grant_type=authorization_code`,
              `scope=${encodeURIComponent("openid email profile User.Read")}`,
            ].join("&"),
          }
        );

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          setStatus("Token exchange failed");
          setTimeout(() => router.replace("/(tabs)/profile"), 1500);
          return;
        }

        // Get user info from Microsoft Graph
        setStatus("Getting email...");
        const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();
        const outlookEmail = userData.mail || userData.userPrincipalName || "";

        if (outlookEmail) {
          // Save email to backend
          await updateProfile({ email: outlookEmail });
          await AsyncStorage.setItem("rivo_outlook_email", outlookEmail);
          setStatus("Connected: " + outlookEmail);
        } else {
          setStatus("No email found in account");
        }

        queryClient.invalidateQueries({ queryKey: ["agent-me"] });
      } catch (err: any) {
        setStatus("Error: " + (err?.message || "Unknown"));
        console.warn("Outlook connect error:", err);
      }

      setTimeout(() => router.replace("/(tabs)/profile"), 1500);
    };

    handleCode();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00D084" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
