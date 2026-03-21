import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
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

export default function ReferralInfoScreen() {
  const insets = useSafeAreaInsets();
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
    const url = `https://partners.rivo.ae?ref=${agentCode}`;
    const msg = config.MESSAGES.SHARE_TEXT.includes("{url}")
      ? config.MESSAGES.SHARE_TEXT.replace("{url}", url)
      : config.MESSAGES.SHARE_TEXT + url;
    try {
      await Share.share({ message: msg });
    } catch {
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: r.screenPadding, paddingBottom: r.sectionGap }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: r.fs(20) }]}>How Referrals Work</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, {
          padding: r.screenPadding,
          paddingBottom: 120,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[styles.title, { fontSize: r.fs(30), marginBottom: r.sp(16) }]}>
            {"Grow your network,\nmultiply your earnings."}
          </Text>
          <Text style={[styles.subtitle, { fontSize: r.fs(18), marginBottom: r.sectionGap }]}>
            Our referral program is designed to reward you for bringing
            high-quality agents into the Rivo ecosystem.
          </Text>

          <View style={[styles.cardsContainer, { gap: r.sectionGap }]}>
            <View style={[styles.card, { padding: r.cardPadding }]}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(0,208,132,0.1)", marginBottom: r.iconTextGap },
                ]}
              >
                <Icon name="people" size={24} color={Colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { fontSize: r.fs(20) }]}>1. Invite Agents</Text>
              <Text style={[styles.cardDesc, { fontSize: r.fs(16) }]}>
                Share your unique referral link with other real estate agents.
                When they sign up using your link, they are automatically tagged
                to your network.
              </Text>
            </View>

            <View style={[styles.card, { padding: r.cardPadding }]}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(59,130,246,0.1)", marginBottom: r.iconTextGap },
                ]}
              >
                <Icon name="briefcase" size={24} color="#3b82f6" />
              </View>
              <Text style={[styles.cardTitle, { fontSize: r.fs(20) }]}>2. They Close Deals</Text>
              <Text style={[styles.cardDesc, { fontSize: r.fs(16) }]}>
                Once your referred agents start submitting mortgage leads, our
                team processes them. You can track their progress in your Network
                tab.
              </Text>
            </View>

            <View style={[styles.card, { padding: r.cardPadding }]}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(168,85,247,0.1)", marginBottom: r.iconTextGap },
                ]}
              >
                <Icon name="flash" size={24} color="#a855f7" />
              </View>
              <Text style={[styles.cardTitle, { fontSize: r.fs(20) }]}>3. Earn Bonuses</Text>
              <Text style={[styles.cardDesc, { fontSize: r.fs(16) }]}>
                You earn a bonus for each of the first {amounts.length}{" "}
                successful disbursals from every agent you refer.
              </Text>

              <View style={[styles.bonusTable, { padding: r.cardPadding, gap: r.sp(14) }]}>
                {amounts.map((amount, i) => (
                  <View key={i} style={styles.bonusRow}>
                    <Text style={[styles.bonusRowLabel, { fontSize: r.fs(14) }]}>
                      {ordinal(i + 1)} Deal
                    </Text>
                    <Text style={[styles.bonusRowValue, { fontSize: r.fs(15) }]}>
                      AED {amount.toLocaleString()} Bonus
                    </Text>
                  </View>
                ))}
                <View style={styles.bonusTotalRow}>
                  <Text style={[styles.bonusTotalLabel, { fontSize: r.fs(14) }]}>Total Potential</Text>
                  <Text style={[styles.bonusTotalValue, { fontSize: r.fs(15) }]}>
                    AED {totalPotential.toLocaleString()} per Agent
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 16),
            paddingHorizontal: r.screenPadding,
            paddingTop: r.sectionGap,
          },
        ]}
      >
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.referBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Icon name="share-social" size={20} color="#000000" />
          <Text style={[styles.referBtnText, { fontSize: r.fs(18) }]}>Refer now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    backgroundColor: "#000000",
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  scrollContent: {},
  title: {
    fontWeight: "500",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  subtitle: {
    color: "#9CA3AF",
    lineHeight: 30,
  },
  cardsContainer: {},
  card: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardDesc: {
    color: "#9CA3AF",
    lineHeight: 26,
  },
  bonusTable: {
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  bonusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bonusRowLabel: {
    color: "#9CA3AF",
  },
  bonusRowValue: {
    fontWeight: "500",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  bonusTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272A",
  },
  bonusTotalLabel: {
    fontWeight: "500",
    color: "#00D084",
  },
  bonusTotalValue: {
    fontWeight: "700",
    color: "#00D084",
    flexShrink: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#27272A",
  },
  referBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  referBtnText: {
    fontWeight: "700",
    color: "#000000",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
