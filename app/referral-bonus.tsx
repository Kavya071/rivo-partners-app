import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Share,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { useConfig } from "@/context/ConfigContext";
import { getMe } from "@/lib/api";
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function ReferralBonusScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;
  const config = useConfig();
  const r = useResponsive();

  const { data: agent } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const agentCode = agent?.agent_code || "";
  const amounts = config.REFERRAL_BONUS.AMOUNTS;
  const totalPotential = config.REFERRAL_BONUS.TOTAL_POTENTIAL;

  const handleShare = async () => {
    const url = `https://partners.rivo.ae/app-invite?ref=${agentCode}`;
    const msg = config.MESSAGES.SHARE_TEXT.includes("{url}")
      ? config.MESSAGES.SHARE_TEXT.replace("{url}", url)
      : config.MESSAGES.SHARE_TEXT + url;
    try {
      await Share.share({ message: msg });
    } catch {
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + webTopPad + r.sp(16),
          paddingBottom: insets.bottom + webBottomPad + r.sp(20),
          paddingHorizontal: r.screenPadding,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingTop: r.sp(12), paddingBottom: r.sp(20) }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[styles.title, { fontSize: r.fs(28), marginBottom: r.sp(12) }]} maxFontSizeMultiplier={r.maxFontScale}>Refer Agents</Text>
          <Text style={[styles.subtitle, { fontSize: r.fs(16), marginBottom: r.sectionGap }]} maxFontSizeMultiplier={r.maxFontScale}>
            <Text style={styles.subtitleLine1}>
              Your network can get you started with Rivo.
            </Text>
            {"\n"}
            <Text style={styles.subtitleLine2}>
              They close deals, you get paid.
            </Text>
          </Text>

          <View style={[styles.timeline, { gap: r.sp(32) }]}>
            <View style={styles.timelineLine} />
            {amounts.map((amount, i) => {
              const isLast = i === amounts.length - 1;
              return (
                <View key={i} style={[styles.timelineItem, { gap: r.sp(20) }]}>
                  <View style={styles.timelineDotWrapper}>
                    {isLast && <View style={styles.timelineDotGlow} />}
                    <View
                      style={[
                        styles.timelineDot,
                        isLast && styles.timelineDotActive,
                      ]}
                    />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineDeal,
                        { fontSize: r.fs(15) },
                        isLast && styles.timelineDealActive,
                      ]}
                    >
                      {ordinal(i + 1)} Deal
                    </Text>
                    <Text
                      style={[
                        styles.timelineAmount,
                        { fontSize: r.fs(20) },
                        isLast && styles.timelineAmountActive,
                      ]}
                    >
                      AED {amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.totalRow, { marginTop: r.sp(48), paddingTop: r.sectionGap }]}>
            <Text style={[styles.totalLabel, { fontSize: r.fs(12) }]}>Total Potential</Text>
            <Text style={[styles.totalValue, { fontSize: r.fs(24) }]}>
              AED {totalPotential.toLocaleString()}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomSection, { gap: r.sp(14), paddingBottom: r.sp(8) }]}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Icon name="share-social" size={20} color="#000" />
          <Text style={[styles.shareBtnText, { fontSize: r.fs(17) }]}>Share your link</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)/home")}
          style={styles.skipBtn}
        >
          <Text style={[styles.skipText, { fontSize: r.fs(14) }]}>Skip for now</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={() => router.push("/referral-info")}
          style={styles.knowMoreRow}
        >
          <Text style={[styles.knowMoreText, { fontSize: r.fs(13) }]}>
            Know more about the referral program{" "}
          </Text>
          <Icon name="chevron-forward" size={16} color={Colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {},
  title: {
    fontWeight: "500",
    color: Colors.text,
    flexShrink: 1,
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 28,
  },
  subtitleLine1: {
    fontFamily: "Inter_400Regular",
    color: "#D4D4D8",
    lineHeight: 30,
  },
  subtitleLine2: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  timeline: {
    position: "relative",
    paddingLeft: 16,
  },
  timelineLine: {
    position: "absolute",
    left: 23,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineDotWrapper: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#27272A",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  timelineDotActive: {
    backgroundColor: Colors.primary,
  },
  timelineDotGlow: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + "30",
  },
  timelineContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  timelineDeal: {
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  timelineDealActive: {
    color: Colors.text,
  },
  timelineAmount: {
    fontWeight: "500",
    color: Colors.text,
    flexShrink: 1,
  },
  timelineAmountActive: {
    color: Colors.primary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#18181B",
  },
  totalLabel: {
    fontWeight: "500",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  totalValue: {
    fontWeight: "500",
    color: Colors.text,
    flexShrink: 1,
    letterSpacing: -0.5,
  },
  bottomSection: {},
  shareBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  shareBtnText: {
    fontWeight: "500",
    color: "#000",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontWeight: "500",
    color: "#71717A",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  knowMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingBottom: 4,
  },
  knowMoreText: {
    fontWeight: "500",
    color: Colors.primary,
  },
});
