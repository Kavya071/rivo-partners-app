# Rivo Partners Mobile App — Claude Code Guide

## Overview
Expo React Native app for Rivo Partners — a mortgage referral platform for real estate agents in Dubai. Agents submit client leads, track deal stages, earn commissions, and refer other agents for bonuses.

## Tech Stack
- **Framework:** Expo SDK 54 + React Native 0.81
- **Language:** TypeScript 5.9
- **Navigation:** expo-router 6 (file-based routing)
- **State:** React Query (`@tanstack/react-query`) for server data, `useState` for local
- **Auth:** WhatsApp OTP verification, token stored in AsyncStorage
- **Push:** expo-notifications + Firebase FCM
- **OAuth:** Google (`@react-native-google-signin`), Outlook (expo-auth-session)
- **Styling:** StyleSheet.create + `useResponsive()` hook for scaling
- **Icons:** Custom SVG `Icon` component (not Ionicons)
- **Build:** EAS Build under `rivoaiteam` Expo org

## Running Locally
```bash
# From monorepo root
pnpm install

# From artifacts/mobile
npx expo start          # LAN mode (same WiFi)
npx expo start --tunnel # Remote (needs ngrok)
npx expo start --web    # Browser testing (limited — no native modules)
```

## Building APK
```bash
eas login                                                    # Login to rivoaiteam account
eas build --profile preview --platform android --non-interactive  # Preview APK
eas build --profile production --platform android            # Production AAB
```

## File Structure
```
app/                    # Screens (expo-router file-based routing)
  _layout.tsx           # Root layout (providers, error boundary, nav guard)
  index.tsx             # Landing page (unauthenticated)
  auth.tsx              # OAuth redirect handler
  (tabs)/               # Authenticated tab screens
    _layout.tsx         # Tab bar configuration
    home.tsx            # Dashboard
    clients.tsx         # Client list with status filters
    network.tsx         # Referral network
    profile.tsx         # Profile settings, OAuth connect, push toggle
  submit-lead.tsx       # Client submission form
  referral-success.tsx  # Success after submission
  referral-bonus.tsx    # Bonus tier display
  referral-info.tsx     # Referral program info
  whatsapp-listening.tsx # WhatsApp verification polling
  terms.tsx, privacy.tsx, bonus-terms.tsx  # Legal pages
components/
  Icon.tsx              # SVG icon system (all icons defined here)
  ErrorBoundary.tsx     # React error boundary
  ErrorFallback.tsx     # Error UI with retry
  WhatsAppPickerSheet.tsx # WhatsApp type selector
context/
  AuthContext.tsx        # Token management, signOut, isAuthenticated
  ConfigContext.tsx      # Backend config (commissions, bonuses, links, banners)
hooks/
  useResponsive.ts      # Screen-size-aware spacing/font scaling
  useNotifications.ts   # Push notification registration/toggle
lib/
  api.ts                # apiFetch wrapper, all API endpoint functions
  notifications.ts      # Expo push token registration
  whatsapp.ts           # WhatsApp pref/code/URL storage
constants/
  colors.ts             # Color palette
  api.ts                # API base URL, country codes
assets/images/
  icon.png              # App icon (1024x1024)
  adaptive-icon.png     # Android adaptive icon foreground
  splash-icon.png       # Splash screen
```

## Key Patterns

### Authentication
- `AuthContext` stores token in AsyncStorage (`rivo_auth_token`)
- `apiFetch()` in `lib/api.ts` auto-attaches `Authorization: Token <token>` header
- `NavGuard` in `_layout.tsx` redirects to `/` when unauthenticated

### API Calls
Always use `apiFetch()` — never raw `fetch()`:
```typescript
import { apiFetch } from "@/lib/api";
const res = await apiFetch("/agents/me/");
const data = await res.json();
```

### Responsive Design
```typescript
const r = useResponsive();
// r.fs(16) — scaled font size
// r.sp(24) — scaled spacing
// r.screenPadding — horizontal page padding
// r.cardPadding — card internal padding
```

### Icons
```typescript
import Icon from "@/components/Icon";
<Icon name="home" size={24} color="#fff" />
```
Available names: home, home-outline, briefcase, briefcase-outline, people, people-outline, person, person-outline, flash, trending-up, arrow-forward, chevron-forward, chevron-down, chevron-up, search, copy-outline, share-social, share-social-outline, arrow-back, close, checkmark, checkmark-circle, shield-checkmark, shield-checkmark-outline, log-out-outline, trash-outline, chatbubble, logo-whatsapp, logo-google, mail-outline, alert-circle, checkbox, square-outline

## Environment Variables
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<Google OAuth Web Client ID>
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=<Azure App Registration Client ID>
```

## Backend API
- **Base URL:** `https://rivo-partners-backend-331738587654.asia-southeast1.run.app/api/v1`
- **Auth:** `Authorization: Token <device_token>` header
- **Key endpoints:** `/agents/me/`, `/agents/init-whatsapp/`, `/agents/profile/`, `/agents/network/`, `/agents/push-register/`, `/clients/`, `/config/`

## Firebase
- **Android:** `google-services.json` in project root
- **iOS:** `GoogleService-Info.plist` in project root
- **FCM V1** credentials uploaded to EAS

## Common Pitfalls

1. **Never create `app/(tabs)/index.tsx`** — conflicts with `app/index.tsx` (landing page), causes "Page not found" errors and infinite redirect loops

2. **Sign-out sequence:** Always `queryClient.clear()` before `signOut()` — otherwise stale React Query cache causes crashes when auth token is removed

3. **Push notifications don't work in Expo Go** (SDK 53+) — must test in preview APK build

4. **`@react-native-google-signin` doesn't work on web** — only in native APK/IPA builds. Wrap in Platform.OS check if needed

5. **Adaptive icon is separate from app icon** — `adaptive-icon.png` (foreground for Android launcher) is different from `icon.png` (standard square icon). Update both when changing the logo

6. **Outlook OAuth uses public client flow** — no client_secret needed. Token exchange happens directly in the app via Microsoft Graph API, not through the backend

7. **React Query keys:** Use consistent keys — `["agent-me"]` for profile, `["network"]` for referrals, `["clients"]` for client list
