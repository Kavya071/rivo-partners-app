# Rivo Partners — Mobile App

Mortgage referral platform for real estate agents in Dubai. Submit client leads, track deal stages, earn commissions, and grow your referral network.

## Prerequisites

- Node.js 22+
- pnpm (`npm install -g pnpm`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account (sign up at https://expo.dev)

## Getting Started

```bash
# Clone the repo
git clone <repo-url>

# Install dependencies (from monorepo root)
cd Rivo-Partners
pnpm install

# Set up environment
cd artifacts/mobile
cp .env.example .env
# Fill in EXPO_PUBLIC_GOOGLE_CLIENT_ID and EXPO_PUBLIC_MICROSOFT_CLIENT_ID

# Run locally
npx expo start
```

## Running on Device

| Method | Command | Requirement |
|--------|---------|-------------|
| Expo Go (LAN) | `npx expo start` | Same WiFi network |
| Expo Go (Tunnel) | `npx expo start --tunnel` | ngrok installed |
| Web Browser | `npx expo start --web` | Limited (no native modules) |

## Building APK

```bash
eas login                          # Login to Expo account
eas build --profile preview --platform android --non-interactive
```

The APK link will be displayed after the build completes (~15-20 min).

## Project Structure

```
app/                    Screens (file-based routing via expo-router)
  (tabs)/               Tab screens (Home, Clients, Network, Profile)
  index.tsx             Landing page
  submit-lead.tsx       Client submission form
  ...
components/             Reusable UI components
  Icon.tsx              SVG icon system
context/                React context providers
  AuthContext.tsx        Authentication state
  ConfigContext.tsx      Backend configuration
hooks/                  Custom React hooks
  useResponsive.ts      Responsive scaling
  useNotifications.ts   Push notification management
lib/                    Utilities and API
  api.ts                API fetch wrapper
constants/              Static values
  colors.ts             Color palette
  api.ts                API config, country codes
assets/images/          App icons and splash screen
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| expo ~54.0.0 | Framework |
| expo-router ~6.0.0 | File-based navigation |
| @tanstack/react-query | Server state management |
| expo-notifications | Push notifications |
| @react-native-google-signin/google-signin | Google OAuth |
| expo-auth-session | Outlook OAuth |
| react-native-reanimated | Animations |
| react-native-svg | SVG icon rendering |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID (from GCP Console) |
| `EXPO_PUBLIC_MICROSOFT_CLIENT_ID` | Microsoft Azure App Registration Client ID |

## Firebase Setup

- **Android:** `google-services.json` in project root
- **iOS:** `GoogleService-Info.plist` in project root
- FCM V1 credentials managed via `eas credentials`
