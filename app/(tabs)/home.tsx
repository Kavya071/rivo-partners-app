import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { getMe, HomeBanner } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

const TAB_BAR_HEIGHT = 84;

function formatCurrency(val: number | string): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-AE");
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const config = useConfig();
  const r = useResponsive();

  const {
    data: agent,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const firstName = agent?.name?.split(" ")[0] || agent?.phone || "Partner";
  const totalEarned = parseFloat(agent?.total_earned || "0");
  const pendingAmount = parseFloat(agent?.pending_amount || "0");
  const disbursalsCount = agent?.disbursed_count ?? 0;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const banners = config.HOME_BANNERS;

  return (
    <View style={styles.container}>
      <View style={[styles.stickyHeader, {
        paddingTop: insets.top > 0 ? insets.top + r.sp(16) : 48,
        paddingHorizontal: r.sp(24),
      }]}>
        <View style={[styles.greetingRow, { gap: r.sp(16), marginBottom: r.sp(32) }]}>
          <View style={[styles.avatarCircle, { width: r.sp(48), height: r.sp(48), borderRadius: r.sp(24) }]}>
            <Text style={[styles.avatarText, { fontSize: r.fs(18) }]}>
              {(agent?.name || agent?.phone || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.greetingTextWrap}>
            <Text style={[styles.greeting, { fontSize: r.fs(20) }]} numberOfLines={1}>{firstName}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { fontSize: r.fs(12) }]}>Online</Text>
            </View>
          </View>
        </View>

        <View style={{ marginBottom: r.sp(8) }}>
          <Text style={[styles.totalPaidLabel, { fontSize: r.fs(14), marginBottom: r.sp(4) }]}>Total Paid</Text>
          <Text style={[styles.totalPaidValue, { fontSize: r.fs(42) }]}>
            AED {totalEarned.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statsRow, { gap: r.sp(32), marginTop: r.sp(24) }]}>
          <View>
            <Text style={[styles.statLabel, { fontSize: r.fs(12), marginBottom: r.sp(4) }]}>PENDING</Text>
            <Text style={[styles.statValue, { fontSize: r.fs(18) }]}>
              AED {formatCurrency(pendingAmount)}
            </Text>
          </View>
          <View>
            <Text style={[styles.statLabel, { fontSize: r.fs(12), marginBottom: r.sp(4) }]}>DISBURSALS</Text>
            <Text style={[styles.statValue, { fontSize: r.fs(18) }]}>{disbursalsCount}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + r.sp(20),
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
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.actionsSection, {
          padding: r.sp(24),
          paddingBottom: r.sp(16),
        }]}>
          <Text style={[styles.sectionTitle, { fontSize: r.fs(18), marginBottom: r.sp(16) }]}>Actions</Text>
          <View style={[styles.actionsColumn, { gap: r.sp(12) }]}>
            <Pressable
              onPress={() => router.push("/submit-lead")}
              style={({ pressed }) => [
                styles.actionCard,
                { padding: r.sp(16) },
                pressed && styles.actionPressed,
              ]}
            >
              <View style={[styles.actionIconWhite, { width: r.sp(40), height: r.sp(40), borderRadius: r.sp(20) }]}>
                <Icon
                  name="arrow-forward"
                  size={20}
                  color="#000"
                  style={{ transform: [{ rotate: "-45deg" }] }}
                />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { fontSize: r.fs(15) }]}>Submit Client</Text>
                <View style={styles.actionSubRow}>
                  <Text style={[styles.actionSub, { fontSize: r.fs(13) }]}>
                    Earn ~AED {config.COMMISSION.AVG_PAYOUT.toLocaleString()}
                  </Text>
                  <View style={styles.commissionBadge}>
                    <Text style={[styles.commissionBadgeText, { fontSize: r.fs(10) }]}>
                      {config.COMMISSION.MIN_PERCENT}% - {config.COMMISSION.MAX_PERCENT}%
                    </Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/network")}
              style={({ pressed }) => [
                styles.actionCard,
                { padding: r.sp(16) },
                pressed && styles.actionPressed,
              ]}
            >
              <View style={[styles.actionIconGreen, { width: r.sp(40), height: r.sp(40), borderRadius: r.sp(20) }]}>
                <Icon name="people" size={20} color="#fff" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { fontSize: r.fs(15) }]}>Invite Agent</Text>
                <Text style={[styles.actionSub, { fontSize: r.fs(13) }]}>
                  Get AED {config.REFERRAL_BONUS.TOTAL_POTENTIAL.toLocaleString()} Bonus
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        </Animated.View>

        {banners.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.bannersSection, {
            paddingHorizontal: r.sp(24),
            gap: r.sp(16),
          }]}>
            {banners.map((banner: HomeBanner) => (
              <Pressable
                key={banner.id}
                onPress={() => {
                  if (banner.cta_link) {
                    if (banner.cta_link.startsWith("/")) {
                      router.push(banner.cta_link as never);
                    } else {
                      Linking.openURL(banner.cta_link);
                    }
                  }
                }}
                style={({ pressed }) => [
                  styles.bannerCard,
                  pressed && { opacity: 0.8 },
                ]}
              >
                {banner.thumbnail ? (
                  <Image
                    source={{ uri: banner.thumbnail }}
                    style={styles.bannerThumbnail}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={[styles.bannerContent, { padding: r.sp(16) }]}>
                  {banner.icon ? (
                    <Text style={[styles.bannerIcon, { fontSize: r.fs(20) }]}>{banner.icon}</Text>
                  ) : null}
                  <Text style={[styles.bannerTitle, { fontSize: r.fs(15) }]}>{banner.title}</Text>
                  {banner.subtitle ? (
                    <Text style={[styles.bannerSubtitle, { fontSize: r.fs(13) }]}>{banner.subtitle}</Text>
                  ) : null}
                  {banner.cta_text && banner.cta_link ? (
                    <Text style={[styles.bannerCtaText, { fontSize: r.fs(13) }]}>{banner.cta_text}</Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {agent?.is_profile_complete === false && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={({ pressed }) => [
                styles.profileNudge,
                { marginHorizontal: r.sp(24), padding: r.sp(16) },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.profileNudgeContent}>
                <Text style={[styles.profileNudgeTitle, { fontSize: r.fs(14) }]}>Complete your profile</Text>
                <Text style={[styles.profileNudgeDesc, { fontSize: r.fs(12) }]}>
                  Add your name, type, and email.
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  stickyHeader: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    paddingBottom: 24,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  greeting: {
    fontWeight: "500",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00D084",
  },
  greetingTextWrap: {
    flexShrink: 1,
    flex: 1,
  },
  onlineText: {
    color: "#A1A1AA",
  },
  totalPaidLabel: {
    color: "#A1A1AA",
  },
  totalPaidValue: {
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: -1,
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: "row",
  },
  statLabel: {
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statValue: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  actionsSection: {},
  sectionTitle: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  actionsColumn: {},
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconWhite: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconGreen: {
    backgroundColor: "#00D084",
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextWrap: {
    flex: 1,
    gap: 4,
  },
  actionSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  actionTitle: {
    fontWeight: "500",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  actionSub: {
    color: "#A1A1AA",
    flexShrink: 1,
  },
  commissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(0, 208, 132, 0.5)",
    shadowColor: "rgba(0, 208, 132, 0.2)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  commissionBadgeText: {
    fontWeight: "700",
    color: "#00D084",
    letterSpacing: 0.5,
  },
  bannersSection: {
    marginTop: 8,
  },
  bannerCard: {
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerThumbnail: {
    width: "100%",
    height: 160,
  },
  bannerContent: {},
  bannerIcon: {
    marginBottom: 8,
  },
  bannerTitle: {
    fontWeight: "600",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  bannerSubtitle: {
    color: "#A1A1AA",
    marginTop: 4,
  },
  bannerCtaText: {
    fontWeight: "600",
    color: "#00D084",
    marginTop: 10,
  },
  profileNudge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 24,
  },
  profileNudgeContent: {
    flex: 1,
  },
  profileNudgeTitle: {
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  profileNudgeDesc: {
    color: "#71717A",
  },
});
