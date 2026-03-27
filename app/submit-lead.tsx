import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { COUNTRY_CODES } from "@/constants/api";
import { ingestClient, getMe } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

export default function SubmitLeadScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;
  const config = useConfig();
  const r = useResponsive();

  const { data: agent } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const [clientName, setClientName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phoneBlurred, setPhoneBlurred] = useState(false);

  const commissionRate = 0.45;
  const MIN_LOAN_AMOUNT = 5000;

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(loanAmount.replace(/,/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [loanAmount]);

  const commission = useMemo(() => {
    return (numericAmount * commissionRate) / 100;
  }, [numericAmount]);

  const sanitizedPhone = useMemo(() => {
    return phone.replace(/\D/g, "");
  }, [phone]);

  const isPhoneValid = useMemo(() => {
    return sanitizedPhone.length === selectedCountry.digits;
  }, [sanitizedPhone, selectedCountry]);

  const fullClientPhone = `${selectedCountry.code}${sanitizedPhone}`;
  const isSelfReferral = isPhoneValid && agent?.phone === fullClientPhone;

  const canSubmit =
    clientName.trim().length > 0 &&
    numericAmount >= MIN_LOAN_AMOUNT &&
    isPhoneValid &&
    !submitting &&
    !isSelfReferral;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await ingestClient({
        client_name: clientName.trim(),
        client_phone: fullClientPhone,
        expected_mortgage_amount: numericAmount,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/referral-success");
    } catch (err: unknown) {
      const apiErr = err as Record<string, string[]>;
      if (apiErr?.client_phone) {
        setError(apiErr.client_phone[0]);
      } else if (apiErr?.non_field_errors) {
        setError(apiErr.non_field_errors[0]);
      } else {
        setError("Failed to submit client. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatLoanDisplay = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setLoanAmount(cleaned);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + webTopPad,
        },
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: r.cardPadding }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: r.fs(17) }]}>New Client</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.commissionCard, { marginHorizontal: r.screenPadding }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.commissionLabel, { fontSize: r.fs(13) }]}>Estimated Commission</Text>
          <Text style={[styles.commissionValue, { fontSize: r.fs(22), marginTop: 4 }]} numberOfLines={1} adjustsFontSizeToFit>
            AED {commission.toLocaleString("en-AE", { maximumFractionDigits: 0 })}
          </Text>
        </View>
        <Text style={[styles.commissionPercent, { fontSize: r.fs(12) }]}>{commissionRate}% of loan</Text>
      </View>

      <KeyboardAwareScrollViewCompat
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: r.screenPadding,
            paddingTop: r.sectionGap,
            gap: r.sectionGap,
            paddingBottom: insets.bottom + webBottomPad + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>Full Name</Text>
          <TextInput
            style={[styles.textInput, { fontSize: r.fs(15), paddingHorizontal: r.cardPadding }]}
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g. Ahmed Al-Mansoor"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>Expected Loan Amount (AED)</Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencyPrefix, { fontSize: r.fs(15), paddingHorizontal: r.sp(14) }]}>AED</Text>
            <TextInput
              style={[styles.textInput, styles.amountInput, { fontSize: r.fs(15), paddingHorizontal: r.cardPadding }]}
              value={loanAmount}
              onChangeText={formatLoanDisplay}
              placeholder="e.g. 1500000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={12}
            />
          </View>
          {numericAmount > 0 && numericAmount < MIN_LOAN_AMOUNT && (
            <Text style={[styles.errorText, { fontSize: r.fs(12) }]}>
              Minimum loan amount is AED {MIN_LOAN_AMOUNT.toLocaleString("en-AE")}
            </Text>
          )}
          {numericAmount >= MIN_LOAN_AMOUNT && (
            <Text style={[styles.calcHelper, { fontSize: r.fs(12) }]}>
              {numericAmount.toLocaleString("en-AE")} x {commissionRate}% = AED{" "}
              {commission.toLocaleString("en-AE", { maximumFractionDigits: 0 })}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>Phone Number</Text>
          <View style={[styles.phoneRow, { gap: r.sp(8) }]}>
            <Pressable
              onPress={() => setShowCountryPicker(true)}
              style={[styles.countryBtn, { paddingHorizontal: r.sp(12) }]}
            >
              <Text style={[styles.countryFlag, { fontSize: r.fs(20) }]}>{selectedCountry.flag}</Text>
              <Text style={[styles.countryCode, { fontSize: r.fs(14) }]}>{selectedCountry.code}</Text>
              <Icon
                name="chevron-down"
                size={14}
                color={Colors.textMuted}
              />
            </Pressable>
            <TextInput
              style={[styles.textInput, styles.phoneInput, { fontSize: r.fs(15), paddingHorizontal: r.cardPadding }]}
              value={phone}
              onChangeText={(text: string) => {
                setPhone(text.replace(/\D/g, ""));
                if (error) setError("");
              }}
              onBlur={() => setPhoneBlurred(true)}
              placeholder={`${selectedCountry.digits} digits`}
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={selectedCountry.digits}
            />
          </View>
          {phoneBlurred && sanitizedPhone.length > 0 && !isPhoneValid && (
            <Text style={[styles.errorHelper, { fontSize: r.fs(12) }]}>
              Enter {selectedCountry.digits} digits for{" "}
              {selectedCountry.country}
            </Text>
          )}
          {isSelfReferral && (
            <Text style={[styles.errorHelper, { fontSize: r.fs(12) }]}>
              You cannot submit yourself as a client.
            </Text>
          )}
          {error ? (
            <Text style={[styles.errorHelper, { fontSize: r.fs(12) }]}>{error}</Text>
          ) : null}
        </View>

        <View style={[styles.consentRow, { gap: r.sp(12), padding: r.cardPadding }]}>
          <Icon
            name="shield-checkmark-outline"
            size={20}
            color="#71717A"
          />
          <Text style={[styles.consentText, { fontSize: r.fs(13) }]}>
            We'll contact them within 30 minutes. By submitting, you confirm
            you have the client's consent to be contacted by Rivo.
          </Text>
        </View>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.submitBar,
          {
            paddingBottom: insets.bottom + webBottomPad + 16,
            paddingHorizontal: r.screenPadding,
          },
        ]}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={[styles.submitText, { fontSize: r.fs(16) }]}>Submit Client</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={[styles.modalHeader, { paddingHorizontal: r.screenPadding }]}>
              <Text style={[styles.modalTitle, { fontSize: r.fs(18) }]}>Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Icon name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCountry(item);
                    setPhone("");
                    setPhoneBlurred(false);
                    setShowCountryPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.countryItem,
                    { paddingHorizontal: r.screenPadding },
                    selectedCountry.code === item.code &&
                      styles.countryItemSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.countryItemFlag, { fontSize: r.fs(24) }]}>{item.flag}</Text>
                  <Text style={[styles.countryItemName, { fontSize: r.fs(15) }]}>{item.country}</Text>
                  <Text style={[styles.countryItemCode, { fontSize: r.fs(14) }]}>{item.code}</Text>
                  {selectedCountry.code === item.code && (
                    <Icon
                      name="checkmark"
                      size={18}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  commissionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commissionLabel: {
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  commissionValue: {
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  commissionPercent: {
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  scrollContent: {},
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  currencyPrefix: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    height: 56,
    lineHeight: 56,
    textAlignVertical: "center",
  },
  amountInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  calcHelper: {
    fontFamily: "Inter_400Regular",
    color: Colors.primary,
    marginLeft: 2,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    color: Colors.danger,
    marginLeft: 2,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: "row",
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
  },
  countryFlag: {},
  countryCode: {
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
  },
  errorHelper: {
    fontFamily: "Inter_400Regular",
    color: Colors.danger,
    marginLeft: 2,
    marginTop: 2,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  consentText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    lineHeight: 19,
  },
  submitBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    fontFamily: "Inter_700Bold",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  countryItemSelected: {
    backgroundColor: Colors.primary + "10",
  },
  countryItemFlag: {},
  countryItemName: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  countryItemCode: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
