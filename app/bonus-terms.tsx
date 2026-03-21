import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "@/components/Icon";

export default function BonusTermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.heading}>Bonus Terms</Text>

        <View style={styles.sections}>
          <Text style={styles.body}>Last updated: February 2026</Text>
          <Text style={styles.body}>
            These terms apply to the Rivo Partner Referral Bonus program.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>1. Eligibility</Text>
            <Text style={styles.body}>
              Bonuses are available to verified partners who refer new agents to
              the Rivo network. The referred agent must not have been previously
              registered with Rivo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>2. Qualification</Text>
            <Text style={styles.body}>
              A "closed deal" is defined as a mortgage application that has been
              successfully disbursed. The bonus is triggered upon the successful
              disbursal of the referred agent's first, second, and third deals
              respectively.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>3. Payouts</Text>
            <Text style={styles.body}>
              Bonus payments are processed within 30 days of the qualifying
              event. Rivo reserves the right to withhold bonuses in cases of
              suspected fraud or violation of terms.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 96,
  },
  backRow: {
    paddingTop: 16,
    marginBottom: 32,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  heading: {
    fontSize: 30,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  sections: {
    gap: 24,
  },
  section: {},
  sectionHeading: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 8,
    fontSize: 14,
  },
  body: {
    color: "#A1A1AA",
    fontSize: 14,
    lineHeight: 22,
  },
});
