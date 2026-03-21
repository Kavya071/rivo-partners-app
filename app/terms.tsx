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

export default function TermsScreen() {
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

        <Text style={styles.heading}>Terms of Service</Text>

        <View style={styles.sections}>
          <Text style={styles.body}>Last updated: February 2026</Text>
          <Text style={styles.body}>
            Please read these terms carefully before using Rivo Partners.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
            <Text style={styles.body}>
              By accessing and using this application, you accept and agree to
              be bound by the terms and provision of this agreement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              2. Agent Referral Bonus Program
            </Text>
            <Text style={styles.body}>
              Bonuses are paid only upon successful disbursal of the loan by the
              referred agent's client. Rivo reserves the right to modify bonus
              structures with prior notice.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>3. User Conduct</Text>
            <Text style={styles.body}>
              You agree to use the app only for lawful purposes and in a way
              that does not infringe the rights of, restrict or inhibit anyone
              else's use and enjoyment of the app.
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
