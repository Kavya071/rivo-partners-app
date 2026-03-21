import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import * as Linking from "expo-linking";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { checkVerification } from "@/lib/api";
import {
  getPendingUrl,
  clearPendingUrl,
  getVerifyCode,
  clearVerifyCode,
  clearReferralCode,
  openWhatsAppFromUrl,
} from "@/lib/whatsapp";
import Icon from "@/components/Icon";

export default function WhatsAppListeningScreen() {
  const insets = useSafeAreaInsets();
  const { code: paramCode, whatsapp_url: paramUrl, verify_link: paramVerifyLink } = useLocalSearchParams<{
    code: string;
    whatsapp_url: string;
    verify_link: string;
  }>();
  const { login } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const hasAutoOpened = useRef(false);
  const [verifyCode, setVerifyCodeState] = useState(paramCode || "");
  const [waUrl, setWaUrl] = useState(paramUrl || "");

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);
  const dotOpacity = useSharedValue(0.3);

  useEffect(() => {
    const loadStored = async () => {
      if (!verifyCode) {
        const stored = await getVerifyCode();
        if (stored) setVerifyCodeState(stored);
      }
      if (!waUrl) {
        const stored = await getPendingUrl();
        if (stored) setWaUrl(stored);
      }
    };
    loadStored();
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
    dotOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    if (!waUrl || hasAutoOpened.current) return;
    hasAutoOpened.current = true;
    const openWa = async () => {
      await clearPendingUrl();
      try {
        await openWhatsAppFromUrl(waUrl);
      } catch {
        try {
          await Linking.openURL(waUrl);
        } catch {
        }
      }
    };
    openWa();
  }, [waUrl]);

  useEffect(() => {
    if (paramVerifyLink) {
      const handleDirectVerify = async () => {
        try {
          await Linking.openURL(paramVerifyLink);
        } catch {
        }
      };
      handleDirectVerify();
    }
  }, [paramVerifyLink]);

  useEffect(() => {
    if (!verifyCode) return;
    intervalRef.current = setInterval(async () => {
      setPollCount((c) => c + 1);
      try {
        const result = await checkVerification(verifyCode);
        if (result.verified && result.token) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          await login(result.token);
          await clearVerifyCode();
          await clearReferralCode();

          const agent = result.agent;
          if (agent && !agent.has_completed_first_action) {
            router.replace("/referral-bonus");
          } else {
            router.replace("/(tabs)/home");
          }
        }
      } catch (_e) {
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [verifyCode]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const handleOpenWhatsApp = async () => {
    if (waUrl) {
      try {
        await openWhatsAppFromUrl(waUrl);
      } catch {
        await Linking.openURL(waUrl);
      }
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top + webTopPad + 40 },
      ]}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={Colors.text} />
      </Pressable>

      <View style={styles.centerContent}>
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.pulse, pulseStyle]} />
            <View style={styles.whatsappCircle}>
              <Icon name="logo-whatsapp" size={48} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.textSection}>
          <Text style={styles.heading}>Tap Send in WhatsApp</Text>
          <Text style={styles.subText}>
            A message with your code is ready — just hit send.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(600)} style={styles.listeningRow}>
          <Animated.View style={[styles.dot, dotStyle]} />
          <Text style={styles.listeningText}>Listening...</Text>
        </Animated.View>

        {pollCount >= 6 && (
          <View style={styles.retryBanner}>
            <Text style={styles.retryText}>
              Still waiting for verification. Make sure you tapped Send in WhatsApp.
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={handleOpenWhatsApp}
        style={({ pressed }) => [
          styles.openAgainBtn,
          pressed && styles.openAgainPressed,
        ]}
      >
        <Icon name="logo-whatsapp" size={20} color={Colors.whatsapp} />
        <Text style={styles.openAgainText}>Open WhatsApp again</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    gap: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  pulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.whatsapp,
  },
  whatsappCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.whatsapp,
    justifyContent: "center",
    alignItems: "center",
  },
  textSection: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    textAlign: "center",
  },
  subText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  listeningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  listeningText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  retryBanner: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  retryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  openAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.whatsapp + "40",
    backgroundColor: Colors.whatsapp + "10",
  },
  openAgainPressed: {
    opacity: 0.7,
  },
  openAgainText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.whatsapp,
  },
});
