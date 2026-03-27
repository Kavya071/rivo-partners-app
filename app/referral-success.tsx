import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

export default function ReferralSuccessScreen() {
  const insets = useSafeAreaInsets();
  const webBottomPad = Platform.OS === "web" ? 34 : 0;
  const r = useResponsive();

  const circleScale = useSharedValue(0.5);
  const circleOpacity = useSharedValue(0);

  useEffect(() => {
    circleScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    circleOpacity.value = withDelay(
      0,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + r.sp(20),
          paddingBottom: insets.bottom + webBottomPad + r.sectionGap,
          paddingHorizontal: r.screenPadding,
        },
      ]}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.centerContent, { gap: r.sp(16) }]}>
        <Animated.View style={[styles.successCircle, { width: r.sp(96), height: r.sp(96), borderRadius: r.sp(48) }, circleStyle]}>
          <Icon name="checkmark" size={r.sp(40)} color="#000" />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(400)}>
          <Text style={[styles.title, { fontSize: r.fs(30) }]}>Client Submitted</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <Text style={[styles.subtitle, { fontSize: r.fs(18), paddingHorizontal: r.sp(20) }]}>
            We've received your client details.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(900).duration(400)} style={[styles.cardsSection, { gap: r.cardGap, marginTop: r.sp(32) }]}>
          <View style={[styles.infoCard, { padding: r.cardPadding, gap: r.iconTextGap }]}>
            <View style={styles.infoCardIconCircle}>
              <Icon name="chatbubble" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { fontSize: r.fs(15) }]}>Updates via WhatsApp</Text>
              <Text style={[styles.infoCardDesc, { fontSize: r.fs(13) }]}>
                You'll receive status changes instantly.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { padding: r.cardPadding, gap: r.iconTextGap }]}>
            <View style={styles.infoCardIconCircle}>
              <Icon name="briefcase" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { fontSize: r.fs(15) }]}>Track in Clients</Text>
              <Text style={[styles.infoCardDesc, { fontSize: r.fs(13) }]}>
                View progress status in Client tab.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(1100).duration(400)}>
        <Pressable
          onPress={() => router.replace("/(tabs)/clients")}
          style={({ pressed }) => [
            styles.doneBtn,
            { marginTop: r.sp(16) },
            pressed && styles.doneBtnPressed,
          ]}
        >
          <Text style={[styles.doneBtnText, { fontSize: r.fs(16) }]}>Done</Text>
        </Pressable>
      </Animated.View>
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
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#00D084",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontWeight: "500",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 28,
  },
  cardsSection: {
    width: "100%",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  infoCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCardText: {
    flex: 1,
    gap: 4,
  },
  infoCardTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  infoCardDesc: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  doneBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  doneBtnText: {
    fontWeight: "500",
    color: "#000",
  },
});
