import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { getMe, updateProfile, logout, deleteAccount } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/Icon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useResponsive } from "@/hooks/useResponsive";
import { useNotifications } from "@/hooks/useNotifications";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || "";

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
  scopes: ["email", "profile"],
});

WebBrowser.maybeCompleteAuthSession();


const AGENT_TYPE_OPTIONS = [
  { value: "RE_BROKER", label: "Real Estate Broker" },
  { value: "MORTGAGE_BROKER", label: "Mortgage Broker" },
  { value: "OTHER", label: "Other" },
];

function getAgentTypeLabel(value: string): string {
  const found = AGENT_TYPE_OPTIONS.find((o) => o.value === value);
  return found ? found.label : value || "Select type";
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const r = useResponsive();

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agentType, setAgentType] = useState("");
  const [agentTypeOther, setAgentTypeOther] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { pushEnabled, togglePush } = useNotifications();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [connectingOutlookState, setConnectingOutlookState] = useState(false);


  const handleGoogleSignIn = async () => {
    setConnectingGoogle(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();
      const googleEmail = response?.data?.user?.email;
      if (googleEmail) {
        setEmail(googleEmail);
        await updateProfile({ email: googleEmail });
        queryClient.invalidateQueries({ queryKey: ["agent-me"] });
      }
    } catch (err) {
      console.warn("Google sign-in error:", err);
    } finally {
      setConnectingGoogle(false);
    }
  };

  const handleOutlookSignIn = async () => {
    if (!MICROSOFT_CLIENT_ID) return;
    setConnectingOutlookState(true);
    try {
      const redirectUri = "rivopartners://auth";
      const authUrl =
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
        `?client_id=${MICROSOFT_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent("openid email profile User.Read")}` +
        `&response_mode=query`;

      await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      // The auth.tsx route handler will catch the redirect and process the code
    } catch (err) {
      console.warn("Outlook sign-in error:", err);
    } finally {
      setConnectingOutlookState(false);
    }
  };

  useEffect(() => {
    if (agent) {
      setName(agent.name ?? "");
      if (!isEditing) {
        setEmail(agent.email ?? "");
      }
      setAgentType(agent.agent_type ?? "");
      setAgentTypeOther(agent.agent_type_other ?? "");
      setReraNumber(agent.rera_number ?? "");
      setIsEditing(!agent.is_profile_complete);
    }
  }, [agent, isEditing]);

  // Pick up Outlook email set by auth.tsx redirect handler — runs on every focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("rivo_outlook_email").then((outlookEmail) => {
        if (outlookEmail) {
          setEmail(outlookEmail);
          AsyncStorage.removeItem("rivo_outlook_email");
        }
      });
    }, [])
  );

  const showReraField = agentType === "RE_BROKER";
  const showOtherField = agentType === "OTHER";

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name,
        email,
        agent_type: agentType,
        agent_type_other: showOtherField ? agentTypeOther : "",
        rera_number: showReraField ? reraNumber : "",
      };
      await updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["agent-me"] });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsEditing(false);
    } catch (_e) {
    } finally {
      setSaving(false);
    }
  };

  const cleanupPushToken = async () => {
    const token = await AsyncStorage.getItem("rivo_push_token");
    if (token) {
      try {
        const { unregisterTokenFromBackend } = await import("@/lib/notifications");
        await unregisterTokenFromBackend(token);
      } catch {}
      await AsyncStorage.removeItem("rivo_push_token");
      await AsyncStorage.removeItem("rivo_push_registered");
    }
  };

  const handleSignOut = async () => {
    await cleanupPushToken();
    try { await logout(); } catch (_e) {}
    queryClient.clear();
    await signOut();
    router.replace("/");
  };

  const handleDelete = async () => {
    await cleanupPushToken();
    try { await deleteAccount(); } catch (_e) {}
    queryClient.clear();
    await signOut();
    router.replace("/");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {
        paddingTop: insets.top > 0 ? insets.top + r.sp(16) : 48,
        paddingHorizontal: r.screenPadding,
        paddingBottom: r.sectionGap,
      }]}>
        <Text style={[styles.headerTitle, { fontSize: r.fs(30) }]}>Profile</Text>
        {!isEditing && (
          <Pressable onPress={() => setIsEditing(true)}>
            <Text style={[styles.editLink, { fontSize: r.fs(16) }]}>Edit</Text>
          </Pressable>
        )}
      </View>

      <KeyboardAwareScrollViewCompat
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, {
          paddingHorizontal: r.screenPadding,
          paddingTop: r.sectionGap,
          paddingBottom: 96 + insets.bottom,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.avatarRow, { gap: r.iconTextGap, marginBottom: r.sectionGap }]}>
          <View style={[styles.avatar, { width: r.sp(80), height: r.sp(80), borderRadius: r.sp(40) }]}>
            <Icon name="person-outline" size={r.sp(40)} color="#A1A1AA" />
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.profileName, { fontSize: r.fs(20) }]} numberOfLines={1}>
              {agent?.name || "Partner"}
            </Text>
            <Text style={[styles.profilePhone, { fontSize: r.fs(14) }]}>{agent?.phone || ""}</Text>
            <View style={styles.verifiedBadge}>
              <Icon
                name="checkmark-circle"
                size={14}
                color={Colors.primary}
              />
              <Text style={[styles.verifiedText, { fontSize: r.fs(13) }]}>Verified Partner</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: r.fs(16), marginBottom: r.sp(16), marginTop: r.sectionGap }]}>Personal Details</Text>

        <View style={[styles.fieldGroup, { marginBottom: r.sp(18) }]}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>Full Name</Text>
          <TextInput
            style={[styles.textInput, { fontSize: r.fs(15), paddingHorizontal: r.cardPadding }, !isEditing && styles.textInputDisabled]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
            placeholder="Your full name"
            editable={isEditing}
          />
        </View>

        <View style={[styles.fieldGroup, { marginBottom: r.sp(18) }]}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>Agent Type</Text>
          <Pressable
            onPress={() => isEditing && setShowTypePicker(!showTypePicker)}
            style={[
              styles.selectInput,
              { paddingHorizontal: r.cardPadding },
              !isEditing && styles.textInputDisabled,
            ]}
          >
            <Text
              style={[
                styles.selectText,
                { fontSize: r.fs(15) },
                !agentType && { color: Colors.textMuted },
              ]}
            >
              {getAgentTypeLabel(agentType)}
            </Text>
            {isEditing && (
              <Icon
                name={showTypePicker ? "chevron-up" : "chevron-down"}
                size={18}
                color={Colors.textMuted}
              />
            )}
          </Pressable>
          {showTypePicker && isEditing && (
            <View style={styles.pickerDropdown}>
              {AGENT_TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setAgentType(opt.value);
                    setShowTypePicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerItem,
                    { paddingHorizontal: r.cardPadding },
                    agentType === opt.value && styles.pickerItemSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { fontSize: r.fs(15) },
                      agentType === opt.value && styles.pickerItemTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {agentType === opt.value && (
                    <Icon
                      name="checkmark"
                      size={16}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {showReraField && (
          <View style={[styles.fieldGroup, { marginBottom: r.sp(18) }]}>
            <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>RERA Number</Text>
            <TextInput
              style={[
                styles.textInput,
                { fontSize: r.fs(15), paddingHorizontal: r.cardPadding },
                !isEditing && styles.textInputDisabled,
              ]}
              value={reraNumber}
              onChangeText={setReraNumber}
              placeholderTextColor={Colors.textMuted}
              placeholder="Enter your RERA number"
              editable={isEditing}
            />
          </View>
        )}

        {showOtherField && (
          <View style={[styles.fieldGroup, { marginBottom: r.sp(18) }]}>
            <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>What do you do?</Text>
            <TextInput
              style={[
                styles.textInput,
                { fontSize: r.fs(15), paddingHorizontal: r.cardPadding },
                !isEditing && styles.textInputDisabled,
              ]}
              value={agentTypeOther}
              onChangeText={setAgentTypeOther}
              placeholderTextColor={Colors.textMuted}
              placeholder="Describe what you do"
              editable={isEditing}
            />
          </View>
        )}

        <Text style={[styles.sectionTitle, { fontSize: r.fs(16), marginBottom: r.sp(16), marginTop: r.sectionGap }]}>Connect Accounts</Text>

        {isEditing && !email.trim() && (
          <>
            <View style={{ gap: r.sp(12), marginBottom: r.sp(16) }}>
              <Pressable
                disabled={connectingGoogle || !GOOGLE_CLIENT_ID}
                onPress={handleGoogleSignIn}
                style={({ pressed }) => [
                  styles.connectBtn,
                  (!GOOGLE_CLIENT_ID || connectingGoogle) && { opacity: 0.5 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {connectingGoogle ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="logo-google" size={20} color="#fff" />
                )}
                <Text style={[styles.connectBtnText, { fontSize: r.fs(14) }]}>
                  {connectingGoogle ? "Connecting..." : "Continue with Google"}
                </Text>
              </Pressable>
              <Pressable
                disabled={connectingOutlookState || !MICROSOFT_CLIENT_ID}
                onPress={handleOutlookSignIn}
                style={({ pressed }) => [
                  styles.connectBtn,
                  (!MICROSOFT_CLIENT_ID || connectingOutlookState) && { opacity: 0.5 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {connectingOutlookState ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="mail-outline" size={20} color="#fff" />
                )}
                <Text style={[styles.connectBtnText, { fontSize: r.fs(14) }]}>
                  {connectingOutlookState ? "Connecting..." : "Continue with Outlook"}
                </Text>
              </Pressable>
            </View>
            <Text style={{ color: "#71717A", textAlign: "center", fontSize: r.fs(13), marginBottom: r.sp(12) }}>or</Text>
          </>
        )}

        <View style={[styles.fieldGroup, { marginBottom: r.sp(18) }]}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(13) }]}>Email</Text>
          <TextInput
            style={[
              styles.textInput,
              { fontSize: r.fs(15), paddingHorizontal: r.cardPadding },
              !isEditing && styles.textInputDisabled,
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
          />
        </View>

        <Text style={[styles.sectionTitle, { fontSize: r.fs(16), marginBottom: r.sp(16), marginTop: r.sectionGap }]}>Notifications</Text>
        <View style={[styles.notificationRow, { marginBottom: r.sectionGap, padding: r.cardPadding, backgroundColor: "#18181B", borderRadius: 12, borderWidth: 1, borderColor: "#27272A" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon name="notifications-outline" size={20} color="#fff" />
            <Text style={[styles.notificationLabel, { fontSize: r.fs(14) }]}>Push Notifications</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={togglePush}
            trackColor={{ false: "#3F3F46", true: "#00D084" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {isEditing ? (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              { marginBottom: r.sectionGap },
              saving && styles.saveBtnDisabled,
              pressed && !saving && { opacity: 0.85 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={[styles.saveBtnText, { fontSize: r.fs(16) }]}>Save Profile</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setIsEditing(true)}
            style={({ pressed }) => [
              styles.editBtn,
              { marginBottom: r.sectionGap },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Icon name="pencil-outline" size={16} color="#fff" />
            <Text style={[styles.editBtnText, { fontSize: r.fs(14) }]}>Edit Profile</Text>
          </Pressable>
        )}

        <View style={[styles.footerSection, { paddingTop: r.sectionGap, gap: r.sp(16) }]}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Icon name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={[styles.signOutText, { fontSize: r.fs(15) }]}>Sign Out</Text>
          </Pressable>

          {!showDeleteConfirm ? (
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Icon name="trash-outline" size={20} color={Colors.danger} />
              <Text style={[styles.deleteBtnText, { fontSize: r.fs(15) }]}>Delete Account</Text>
            </Pressable>
          ) : (
            <View style={[styles.deleteConfirm, { padding: r.cardPadding, gap: r.sp(12) }]}>
              <Text style={[styles.deleteConfirmText, { fontSize: r.fs(14) }]}>
                Are you sure? This cannot be undone.
              </Text>
              <View style={[styles.deleteConfirmActions, { gap: r.cardGap }]}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  style={({ pressed }) => [
                    styles.deleteConfirmCancel,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.deleteConfirmCancelText, { fontSize: r.fs(14) }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.deleteConfirmDelete,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.deleteConfirmDeleteText, { fontSize: r.fs(14) }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollViewCompat>
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
  header: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "500",
    color: Colors.text,
  },
  editLink: {
    color: "#00D084",
    fontWeight: "500",
  },
  scrollContent: {},
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontWeight: "700",
    color: Colors.text,
    flexShrink: 1,
  },
  profilePhone: {
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontWeight: "600",
    color: Colors.text,
  },
  fieldGroup: {},
  fieldLabel: {
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    height: 56,
    color: Colors.text,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  selectInput: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: Colors.text,
    flex: 1,
  },
  pickerDropdown: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    marginTop: 4,
    overflow: "hidden",
  },
  pickerItem: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  pickerItemSelected: {
    backgroundColor: "#27272A",
  },
  pickerItemText: {
    color: Colors.text,
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
  },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    height: 48,
  },
  connectBtnText: {
    color: Colors.text,
    fontWeight: "500",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000000",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3F3F46",
    height: 52,
  },
  editBtnText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationLabel: {
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontWeight: "600",
    color: "#000000",
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "#27272A",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  signOutText: {
    color: Colors.danger,
    fontWeight: "500",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  deleteBtnText: {
    color: Colors.danger,
    fontWeight: "500",
  },
  deleteConfirm: {
    backgroundColor: "#18181B",
    borderRadius: 8,
  },
  deleteConfirmText: {
    color: Colors.text,
  },
  deleteConfirmActions: {
    flexDirection: "row",
  },
  deleteConfirmCancel: {
    flex: 1,
    backgroundColor: "#27272A",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteConfirmCancelText: {
    color: Colors.text,
    fontWeight: "500",
  },
  deleteConfirmDelete: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteConfirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
