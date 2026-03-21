import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { initWhatsApp, resolveReferralCode } from "@/lib/api";
import {
  getWhatsAppPref,
  setReferralCode,
  getReferralCode,
  setVerifyCode,
  setPendingUrl,
  WhatsAppType,
} from "@/lib/whatsapp";
import WhatsAppPickerSheet from "@/components/WhatsAppPickerSheet";
import Icon, { IconName } from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

interface ValueProp {
  title: string;
  desc: string;
  icon: IconName;
  iconSize: number;
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: "Fast Referrals",
    desc: "Submit a client in 60 seconds.",
    icon: "flash",
    iconSize: 20,
  },
  {
    title: "Real-Time Tracking",
    desc: "Live updates on every case.",
    icon: "trending-up",
    iconSize: 20,
  },
  {
    title: "Network Bonus",
    desc: "Earn by referring other agents.",
    icon: "people",
    iconSize: 20,
  },
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const config = useConfig();
  const r = useResponsive();
  const params = useLocalSearchParams<{
    ref?: string;
    referral_code?: string;
    is_sign_in?: string;
  }>();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [referralName, setReferralName] = useState<string | null>(null);
  const [pendingSignIn, setPendingSignIn] = useState(false);

  const pulseDotScale = useSharedValue(1);
  const pulseDotOpacity = useSharedValue(1);

  useEffect(() => {
    pulseDotScale.value = withRepeat(
      withTiming(2, { duration: 1200, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    pulseDotOpacity.value = withRepeat(
      withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const pulseDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseDotScale.value }],
    opacity: pulseDotOpacity.value,
  }));

  useEffect(() => {
    const refCode = params.ref || params.referral_code;
    if (refCode) {
      setReferralCode(refCode);
      resolveReferralCode(refCode)
        .then((data) => setReferralName(data.agent_name))
        .catch(() => setReferralName("Partner Agent"));
    }
  }, [params.ref, params.referral_code]);

  // Check clipboard for referral code (deferred deep linking)
  useEffect(() => {
    if (params.ref || params.referral_code) return; // Already have a ref from params
    const checkClipboard = async () => {
      try {
        const hasString = await Clipboard.hasStringAsync();
        if (!hasString) return;
        const text = await Clipboard.getStringAsync();
        const match = text.match(/^RIVO-[A-Z0-9]{4}$/);
        if (match) {
          const clipRef = match[0];
          setReferralCode(clipRef);
          resolveReferralCode(clipRef)
            .then((data) => setReferralName(data.agent_name))
            .catch(() => setReferralName("Partner Agent"));
        }
      } catch {
        // Clipboard access may be denied, silently ignore
      }
    };
    checkClipboard();
  }, []);

  useEffect(() => {
    if (params.is_sign_in === "true" && termsAccepted && !loading) {
      handleGetStarted(true);
    }
  }, [params.is_sign_in, termsAccepted]);

  const proceedToWhatsApp = async (
    isSignIn: boolean,
    whatsappType?: WhatsAppType,
  ) => {
    setLoading(true);
    try {
      const storedRef = await getReferralCode();
      const isBusinessPick = whatsappType === "business";
      const { code, whatsapp_url } = await initWhatsApp(
        storedRef || "",
        isBusinessPick,
        isSignIn,
      );

      const configUrl = isBusinessPick
        ? config.LINKS.WHATSAPP_BUSINESS
        : config.LINKS.WHATSAPP_PERSONAL;
      const resolvedUrl = whatsapp_url || configUrl;

      await setVerifyCode(code);
      await setPendingUrl(resolvedUrl);

      router.push({
        pathname: "/whatsapp-listening",
        params: { code, whatsapp_url: resolvedUrl },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = async (isSignIn = false) => {
    if (!termsAccepted || loading) return;
    setPendingSignIn(isSignIn);

    const pref = await getWhatsAppPref();
    if (pref) {
      proceedToWhatsApp(isSignIn, pref);
    } else {
      setShowPicker(true);
    }
  };

  const handlePickerSelect = (type: WhatsAppType) => {
    proceedToWhatsApp(pendingSignIn, type);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) return null;

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + webTopPad + r.sp(20),
          paddingBottom: insets.bottom + webBottomPad + r.sp(20),
          paddingHorizontal: r.screenPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
        <View style={[styles.logoRow, { gap: r.sp(10) }]}>
          <View style={[styles.logoBg, { width: r.sp(40), height: r.sp(40), borderRadius: r.sp(10) }]}>
            <Text style={[styles.logoLetter, { fontSize: r.fs(22) }]}>R</Text>
          </View>
          <Text style={[styles.logoText, { fontSize: r.fs(20) }]}>Rivo Partners</Text>
        </View>

        {referralName && (
          <View style={[styles.referralBadge, { paddingHorizontal: r.sp(12), paddingVertical: r.sp(8), gap: r.sp(10) }]}>
            <View style={styles.referralDotContainer}>
              <Animated.View style={[styles.referralDotPulse, pulseDotStyle]} />
              <View style={styles.referralDot} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={[styles.referralLabel, { fontSize: r.fs(10) }]}>Referred by</Text>
              <Text style={[styles.referralNameText, { fontSize: r.fs(13) }]} numberOfLines={1}>{referralName}</Text>
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.heroSection, { gap: r.sp(24) }]}>
        <Text style={[styles.heroTitle, { fontSize: r.fs(32), lineHeight: r.sp(40) }]}>
          Earn on every{"\n"}
          <Text style={styles.heroTitleGreen}>mortgage you refer.</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { fontSize: r.fs(16) }]}>
          Dubai's premier mortgage referral platform for real estate agents
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.valueProps, { gap: r.sp(32) }]}>
        {VALUE_PROPS.map((prop, i) => (
          <View key={i} style={[styles.valuePropRow, { gap: r.sp(16) }]}>
            <Icon name={prop.icon} size={22} color={Colors.primary} />
            <View style={styles.valuePropText}>
              <Text style={[styles.valuePropTitle, { fontSize: r.fs(16) }]}>{prop.title}</Text>
              <Text style={[styles.valuePropDesc, { fontSize: r.fs(14) }]}>{prop.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.payoutSection}>
        <View style={styles.payoutDivider} />
        <View style={[styles.payoutContent, { paddingVertical: r.sp(20) }]}>
          <View style={[styles.payoutRow, { gap: r.sp(8) }]}>
            <Text style={[styles.payoutAmount, { fontSize: r.fs(32) }]}>
              AED {config.COMMISSION.AVG_PAYOUT.toLocaleString()}<Text style={{ fontSize: r.fs(16), color: Colors.text }}>^</Text>
            </Text>
            <View style={styles.rateBadge}>
              <Text style={[styles.rateBadgeText, { fontSize: r.fs(10) }]}>
                {config.COMMISSION.MIN_PERCENT}% - {config.COMMISSION.MAX_PERCENT}%
              </Text>
            </View>
          </View>
          <Text style={[styles.payoutSubtext, { fontSize: r.fs(13) }]}>
            Average payout per deal · on a AED 1.8M loan
          </Text>
        </View>
        <View style={styles.payoutDivider} />
      </Animated.View>

      <View style={[styles.bottomSection, { gap: r.sp(16) }]}>
        <View style={[styles.termsRow, { gap: r.sp(10) }]}>
          <Pressable onPress={() => setTermsAccepted(!termsAccepted)}>
            <Icon
              name={termsAccepted ? "checkbox" : "square-outline"}
              size={24}
              color={termsAccepted ? Colors.primary : Colors.borderLight}
            />
          </Pressable>
          <Text style={[styles.termsText, { fontSize: r.fs(14) }]}>
            <Text onPress={() => setTermsAccepted(!termsAccepted)}>
              I agree to the{" "}
            </Text>
            <Text
              style={styles.termsLink}
              onPress={() => router.push("/terms")}
            >
              Terms & Conditions
            </Text>
          </Text>
        </View>

        <Pressable
          onPress={() => handleGetStarted(false)}
          disabled={!termsAccepted || loading}
          style={({ pressed }) => [
            styles.ctaButton,
            (!termsAccepted || loading) && styles.ctaDisabled,
            pressed && termsAccepted && !loading && styles.ctaPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Icon name="logo-whatsapp" size={22} color="#25D366" />
              <Text style={[styles.ctaText, { fontSize: r.fs(17) }]}>Get Started</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleGetStarted(true)}
          disabled={!termsAccepted || loading}
          style={styles.signInRow}
        >
          <Text style={[styles.signInText, { fontSize: r.fs(14) }, (!termsAccepted || loading) && { opacity: 0.4 }]}>
            Already have an account?{" "}
            <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </Pressable>
      </View>

      <WhatsAppPickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickerSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBg: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoLetter: {
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  referralBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    flexShrink: 1,
    maxWidth: "60%",
  },
  referralDotContainer: {
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  referralDotPulse: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  referralDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  referralLabel: {
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  referralNameText: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    flexShrink: 1,
  },
  heroSection: {},
  heroTitle: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    flexShrink: 1,
  },
  heroTitleGreen: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  valueProps: {},
  valuePropRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  valuePropText: {
    flex: 1,
    gap: 2,
  },
  valuePropTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  valuePropDesc: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  payoutSection: {},
  payoutDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  payoutContent: {},
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  payoutAmount: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  rateBadge: {
    borderWidth: 1,
    borderColor: Colors.primary + "50",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.background,
  },
  rateBadgeText: {
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  payoutSubtext: {
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
    marginTop: 4,
  },
  bottomSection: {},
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  termsText: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "500",
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    color: "#000",
  },
  signInRow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  signInText: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  signInLink: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
});
