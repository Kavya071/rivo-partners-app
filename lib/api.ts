import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const TOKEN_KEY = "rivo_auth_token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    await clearToken();
  }
  return res;
}

export interface InitWhatsAppResponse {
  code: string;
  whatsapp_url: string;
}

export interface VerificationResponse {
  verified: boolean;
  token?: string;
  agent?: AgentProfile;
}

export interface AgentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  agent_type: string;
  agent_type_other: string;
  rera_number: string;
  agent_code: string;
  is_whatsapp_business: boolean;
  is_profile_complete: boolean;
  has_completed_first_action: boolean;
  total_earned: string;
  pending_amount: string;
  disbursed_count: number;
  this_month_earned: string;
  created_at: string;
  updated_at: string;
  agent_type_options?: string[];
  referral_code?: string;
}

export interface ClientRecord {
  id: number;
  client_name: string;
  client_phone: string;
  expected_mortgage_amount: number;
  commission: number;
  commission_amount: number | null;
  estimated_commission: number;
  status: string;
  created_at: string;
}

export interface ReferredAgent {
  id: string;
  name: string;
  agent_code: string;
  created_at: string;
  deals_count: number;
  bonus_earned: number;
}

export interface NetworkResponse {
  agent_code: string;
  referred_agents: ReferredAgent[];
  bonus_summary: {
    total_earned: number;
    bonuses_count: number;
    max_bonuses: number;
    completed: boolean;
  };
}

export interface HomeBanner {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  thumbnail: string;
  cta_text: string;
  cta_link: string;
  order: number;
}

export interface AppConfigResponse {
  commission_min_percent: number;
  commission_max_percent: number;
  avg_payout: number;
  referrer_bonuses: number[];
  new_agent_bonuses: number[];
  whatsapp_personal: string;
  whatsapp_business: string;
  referral_share_msg: string;
  otp_msg: string;
  home_banners: HomeBanner[];
}

export interface ReferralCodeResponse {
  agent_name: string;
}

export async function initWhatsApp(
  referralCode = "",
  isWhatsappBusiness = false,
  isSignIn = false,
): Promise<InitWhatsAppResponse> {
  const res = await apiFetch("/agents/init-whatsapp/", {
    method: "POST",
    body: JSON.stringify({
      referral_code: referralCode,
      is_whatsapp_business: isWhatsappBusiness,
      is_sign_in: isSignIn,
      source: "mobile",
    }),
  });
  if (!res.ok) throw new Error("Failed to init WhatsApp");
  return res.json();
}

export async function checkVerification(
  code: string,
): Promise<VerificationResponse> {
  const res = await apiFetch(`/agents/check-verification/${code}/`);
  if (!res.ok) throw new Error("Verification check failed");
  return res.json();
}

export async function resolveReferralCode(
  code: string,
): Promise<ReferralCodeResponse> {
  const res = await apiFetch(`/agents/referral/${code}/`);
  if (!res.ok) throw new Error("Invalid referral code");
  return res.json();
}

export async function getMe(): Promise<AgentProfile> {
  const res = await apiFetch("/agents/me/");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function getClients(
  search?: string,
): Promise<ClientRecord[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/clients/${query}`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function ingestClient(data: {
  client_name: string;
  client_phone: string;
  expected_mortgage_amount: number;
}): Promise<{ id: number }> {
  const res = await apiFetch("/clients/ingest/", {
    method: "POST",
    body: JSON.stringify({ ...data, consent: true }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw err;
  }
  return res.json();
}

export async function getNetwork(): Promise<NetworkResponse> {
  const res = await apiFetch("/agents/network/");
  if (!res.ok) throw new Error("Failed to fetch network");
  return res.json();
}

export async function updateProfile(data: {
  name?: string;
  agent_type?: string;
  agent_type_other?: string;
  email?: string;
  rera_number?: string;
}): Promise<AgentProfile> {
  const res = await apiFetch("/agents/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function getAppConfig(): Promise<AppConfigResponse> {
  const res = await apiFetch("/config/");
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function logout(): Promise<void> {
  await apiFetch("/agents/logout/", { method: "POST" });
  await clearToken();
}

export async function deleteAccount(): Promise<void> {
  await apiFetch("/agents/delete/", { method: "DELETE" });
  await clearToken();
}

export async function connectOutlook(
  code: string,
  redirectUri: string,
): Promise<AgentProfile> {
  const res = await apiFetch("/agents/connect-outlook/", {
    method: "POST",
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });
  if (!res.ok) throw new Error("Failed to connect Outlook");
  return res.json();
}

export interface StoreReferralResponse {
  unique_id: string;
}

export interface GetReferralResponse {
  ref_code: string;
  claimed: boolean;
}

export async function storeReferral(
  refCode: string,
): Promise<StoreReferralResponse> {
  const res = await apiFetch("/agents/store-referral/", {
    method: "POST",
    body: JSON.stringify({ ref_code: refCode }),
  });
  if (!res.ok) throw new Error("Failed to store referral");
  return res.json();
}

export async function getReferral(
  uniqueId: string,
): Promise<GetReferralResponse> {
  const res = await apiFetch(`/agents/get-referral/${uniqueId}/`);
  if (!res.ok) throw new Error("Failed to get referral");
  return res.json();
}
