import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  RefreshControl,
  Animated as RNAnimated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { getNetwork, ReferredAgent } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

const TAB_BAR_HEIGHT = 84;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AE", {
    month: "short",
    day: "numeric",
  });
}

function formatBonusAmounts(amounts: number[]): string {
  if (amounts.length === 0) return "";
  const formatted = amounts.map(
    (a) => `AED ${a.toLocaleString("en-AE")}`,
  );
  if (formatted.length === 1) return formatted[0];
  return formatted.join(", ") + " respectively.";
}

function SkeletonRow() {
  const opacity = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <RNAnimated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonStat} />
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <View style={styles.skeletonBonus} />
        <View style={styles.skeletonLabel} />
      </View>
    </RNAnimated.View>
  );
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const config = useConfig();
  const r = useResponsive();
  const [copyLabel, setCopyLabel] = useState("Tap to copy link");

  const {
    data: networkData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["network"],
    queryFn: getNetwork,
  });

  const referralCode = networkData?.agent_code ?? "RIVO-XXXX";
  const referredAgents: ReferredAgent[] = networkData?.referred_agents ?? [];
  const bonusSummary = networkData?.bonus_summary;
  const referralLink = `https://partners.rivo.ae/app-invite?ref=${referralCode}`;

  const referrerBonuses = config.REFERRAL_BONUS.AMOUNTS;

  const getShareMessage = () => {
    const msg = config.MESSAGES.SHARE_TEXT;
    if (msg.includes("{url}")) {
      return msg.replace("{url}", referralLink);
    }
    return msg + referralLink;
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Tap to copy link"), 2000);
  };

  const handleShare = async () => {
    const message = getShareMessage();
    try {
      await Share.share({ message });
    } catch (_e) {
    }
  };

  const howItWorks = [
    {
      step: "1",
      title: "Ask Agents to join Rivo",
      desc: "Share your link with agents in your network.",
      circleStyle: styles.stepCircle,
      numberStyle: styles.stepNumber,
    },
    {
      step: "2",
      title: "They refer mortgages to Rivo",
      desc: `Bonuses unlock on their first ${referrerBonuses.length} disbursals.`,
      circleStyle: styles.stepCircle,
      numberStyle: styles.stepNumber,
    },
    {
      step: "3",
      title: "You both get paid",
      desc: formatBonusAmounts(referrerBonuses),
      circleStyle: styles.stepCircleGreen,
      numberStyle: styles.stepNumberBlack,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, {
        paddingTop: insets.top > 0 ? insets.top + r.sp(16) : 48,
        paddingHorizontal: r.sp(24),
        paddingBottom: r.sp(32),
      }]}>
        <Text style={[styles.pageTitle, { fontSize: r.fs(30), marginBottom: r.sp(24) }]}>Network</Text>

        <Text style={[styles.codeLabel, { fontSize: r.fs(14) }]}>Your Referral Code</Text>
        <View style={[styles.codeBox, { padding: r.sp(16), marginBottom: r.sp(20) }]}>
          <Text style={[styles.codeText, { fontSize: r.fs(28) }]}>{referralCode}</Text>
        </View>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Icon name="logo-whatsapp" size={22} color="#25D366" />
          <Text style={[styles.shareBtnText, { fontSize: r.fs(16) }]}>Invite your network</Text>
        </Pressable>

        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.copyRow,
            { marginTop: r.sp(16) },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Icon name="copy-outline" size={16} color="#A1A1AA" />
          <Text style={[styles.copyRowText, { fontSize: r.fs(14) }]}>{copyLabel}</Text>
        </Pressable>

        <View style={[styles.divider, { marginTop: r.sp(20) }]} />

        <Pressable
          onPress={() => router.push("/referral-info")}
          style={[styles.knowMoreRow, { marginTop: r.sp(16) }]}
        >
          <Text style={[styles.knowMoreText, { fontSize: r.fs(14) }]}>
            Know more about the referral program{" "}
          </Text>
          <Icon name="chevron-forward" size={16} color="#00D084" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + r.sp(96),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={[styles.body, { paddingHorizontal: r.sp(24), paddingTop: r.sp(32) }]}>
          <Text style={[styles.sectionTitle, { fontSize: r.fs(18), marginBottom: r.sp(24) }]}>How it works</Text>
          <View style={[styles.stepsContainer, { marginBottom: r.sp(24) }]}>
            <View style={styles.connectingLine} />
            {howItWorks.map((item, i) => (
              <View key={i} style={[styles.stepRow, { gap: r.sp(20), marginBottom: r.sp(32) }]}>
                <View style={item.circleStyle}>
                  <Text style={item.numberStyle}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { fontSize: r.fs(15) }]}>{item.title}</Text>
                  <Text style={[styles.stepDesc, { fontSize: r.fs(13) }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.termsDivider, { marginBottom: r.sp(24) }]}>
            <View style={styles.divider} />
            <Text style={[styles.termsNote, { fontSize: r.fs(11), marginTop: r.sp(12), marginBottom: r.sp(8) }]}>
              *Terms and conditions apply. Bonuses are subject to{"\n"}successful loan disbursal and verification.
            </Text>
            <Pressable onPress={() => router.push("/terms")}>
              <Text style={[styles.termsLink, { fontSize: r.fs(12) }]}>Read full T&Cs →</Text>
            </Pressable>
          </View>

          <View style={[styles.networkHeader, { gap: r.sp(12), marginBottom: r.sp(16) }]}>
            <Icon name="people" size={20} color="white" />
            <Text style={[styles.sectionTitle, { fontSize: r.fs(18), marginBottom: 0 }]}>Your Network</Text>
          </View>

          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : referredAgents.length === 0 ? (
            <Text style={[styles.emptyText, { fontSize: r.fs(14) }]}>
              No agents in your network yet. Share your link to start earning
              bonuses.
            </Text>
          ) : (
            referredAgents.map((agent) => (
              <View
                key={agent.id}
                style={[
                  styles.agentRow,
                  { paddingVertical: r.sp(14) },
                  agent.deals_count === 0 && { opacity: 0.5 },
                ]}
              >
                <View style={styles.agentInfo}>
                  <Text style={[styles.agentName, { fontSize: r.fs(15) }]} numberOfLines={1}>{agent.name || "Agent"}</Text>
                  <Text style={[styles.agentStat, { fontSize: r.fs(12) }]}>
                    Joined {formatDate(agent.created_at)} &middot;{" "}
                    {agent.deals_count}/
                    {bonusSummary?.max_bonuses ?? referrerBonuses.length} Deals
                  </Text>
                </View>
                <View style={styles.agentBonus}>
                  <Text
                    style={[
                      styles.bonusValue,
                      { fontSize: r.fs(16) },
                      agent.bonus_earned > 0
                        ? { color: "#00D084" }
                        : { color: "#71717A" },
                    ]}
                  >
                    +AED {agent.bonus_earned}
                  </Text>
                  <Text style={[styles.bonusLabel, { fontSize: r.fs(10) }]}>BONUS</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  codeLabel: {
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: "#18181B",
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  codeText: {
    fontFamily: "Inter_500Medium",
    color: Colors.text,
    letterSpacing: 3,
    flexShrink: 1,
  },
  shareBtn: {
    backgroundColor: "white",
    borderRadius: 8,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  shareBtnText: {
    fontFamily: "Inter_600SemiBold",
    color: "black",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  copyRowText: {
    fontFamily: "Inter_400Regular",
    color: "#A1A1AA",
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#27272A",
  },
  knowMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  knowMoreText: {
    fontFamily: "Inter_500Medium",
    color: "#00D084",
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  body: {},
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  stepsContainer: {
    position: "relative",
  },
  connectingLine: {
    position: "absolute",
    left: 15,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: "#27272A",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00D084",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.text,
  },
  stepNumberBlack: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "black",
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  stepDesc: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  termsDivider: {},
  termsNote: {
    fontFamily: "Inter_400Regular",
    color: "#52525B",
    lineHeight: 16,
    textAlign: "center",
  },
  termsLink: {
    color: "#00D084",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    lineHeight: 20,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  agentInfo: {
    flex: 1,
    gap: 4,
  },
  agentName: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    flexShrink: 1,
  },
  agentStat: {
    fontFamily: "Inter_400Regular",
    color: "#71717A",
  },
  agentBonus: {
    alignItems: "flex-end",
    gap: 2,
  },
  bonusValue: {
    fontFamily: "Inter_700Bold",
  },
  bonusLabel: {
    fontFamily: "Inter_500Medium",
    color: "#71717A",
    letterSpacing: 1,
  },
  skeletonRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  skeletonName: {
    width: 120,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
  skeletonStat: {
    width: 160,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
  skeletonBonus: {
    width: 80,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
  skeletonLabel: {
    width: 40,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
});
