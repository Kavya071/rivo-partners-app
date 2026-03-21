import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

export type WhatsAppType = "personal" | "business";

const PREF_KEY = "rivo_whatsapp_pref";
const PENDING_URL_KEY = "rivo_wa_pending";
const VERIFY_CODE_KEY = "rivo_verify_code";
const REFERRAL_CODE_KEY = "rivo_referral_code";

export async function getWhatsAppPref(): Promise<WhatsAppType | null> {
  const v = await AsyncStorage.getItem(PREF_KEY);
  return v === "personal" || v === "business" ? v : null;
}

export async function setWhatsAppPref(type: WhatsAppType): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, type);
}

export async function clearWhatsAppPref(): Promise<void> {
  await AsyncStorage.removeItem(PREF_KEY);
}

export async function setPendingUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_URL_KEY, url);
}

export async function getPendingUrl(): Promise<string | null> {
  return AsyncStorage.getItem(PENDING_URL_KEY);
}

export async function clearPendingUrl(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_URL_KEY);
}

export async function setVerifyCode(code: string): Promise<void> {
  await AsyncStorage.setItem(VERIFY_CODE_KEY, code);
}

export async function getVerifyCode(): Promise<string | null> {
  return AsyncStorage.getItem(VERIFY_CODE_KEY);
}

export async function clearVerifyCode(): Promise<void> {
  await AsyncStorage.removeItem(VERIFY_CODE_KEY);
}

export async function setReferralCode(code: string): Promise<void> {
  await AsyncStorage.setItem(REFERRAL_CODE_KEY, code);
}

export async function getReferralCode(): Promise<string | null> {
  return AsyncStorage.getItem(REFERRAL_CODE_KEY);
}

export async function clearReferralCode(): Promise<void> {
  await AsyncStorage.removeItem(REFERRAL_CODE_KEY);
}

function isIOS(): boolean {
  return Platform.OS === "ios";
}

function buildDeepLink(type: WhatsAppType, params: string): string {
  if (type === "personal") {
    return `whatsapp://send?${params}`;
  }
  if (isIOS()) {
    return `whatsapp-smb://send?${params}`;
  }
  return `intent://send?${params}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
}

export async function openWhatsAppChat(
  phone: string,
  text: string,
  type?: WhatsAppType,
): Promise<void> {
  const pref = type ?? (await getWhatsAppPref());
  const encoded = encodeURIComponent(text);

  if (pref) {
    const url = buildDeepLink(pref, `phone=${phone}&text=${encoded}`);
    await Linking.openURL(url);
  } else {
    await Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
  }
}

export async function openWhatsAppFromUrl(
  waUrl: string,
): Promise<void> {
  try {
    const pref = await getWhatsAppPref();
    if (pref) {
      const url = new URL(waUrl);
      const phone = url.pathname.replace("/", "");
      const text = url.searchParams.get("text") || "";
      await openWhatsAppChat(phone, text, pref);
    } else {
      await Linking.openURL(waUrl);
    }
  } catch {
    await Linking.openURL(waUrl);
  }
}
