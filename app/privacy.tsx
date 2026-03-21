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

export default function PrivacyScreen() {
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

        <Text style={styles.heading}>Privacy Policy</Text>

        <View style={styles.sections}>
          <Text style={styles.body}>Last updated: February 2026</Text>
          <Text style={styles.body}>
            Your privacy is important to us. It is Rivo's policy to respect your
            privacy regarding any information we may collect from you across our
            application.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              1. Information We Collect
            </Text>
            <Text style={styles.body}>
              We collect information you provide directly to us, such as your
              name, phone number, and referral details when you use our
              services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              2. How We Use Information
            </Text>
            <Text style={styles.body}>
              We use the information to process referrals, pay commissions,
              communicate with you, and improve our services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>3. Data Security</Text>
            <Text style={styles.body}>
              We take reasonable measures to help protect information about you
              from loss, theft, misuse and unauthorized access, disclosure,
              alteration and destruction.
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
