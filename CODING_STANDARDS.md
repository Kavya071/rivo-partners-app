# Rivo Partners Mobile — Coding Standards

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Screen files | kebab-case | `submit-lead.tsx`, `referral-bonus.tsx` |
| Components | PascalCase | `Icon.tsx`, `ErrorFallback.tsx` |
| Hooks | camelCase with `use` prefix | `useResponsive.ts`, `useNotifications.ts` |
| Utils/libs | camelCase | `api.ts`, `notifications.ts` |
| Constants | camelCase | `colors.ts`, `api.ts` |

## Components

- **Functional components only** — no class components (except ErrorBoundary)
- **Export default** for screen components
- **Named exports** for shared utilities
- **Co-locate styles** — use `StyleSheet.create` at the bottom of each file
- **One component per file** — helper sub-components within the same file are OK

```typescript
// Good
export default function HomeScreen() {
  const r = useResponsive();
  return ( ... );
}

const styles = StyleSheet.create({ ... });
```

## State Management

| Data Type | Tool | Example |
|-----------|------|---------|
| Server data | React Query | `useQuery({ queryKey: ["agent-me"], queryFn: getMe })` |
| Form state | useState | `const [name, setName] = useState("")` |
| Persisted data | AsyncStorage | Auth token, WhatsApp preferences |
| App config | ConfigContext | Commission rates, bonus amounts, links |
| Auth state | AuthContext | `isAuthenticated`, `signOut()` |

**Never** store server data in useState — always use React Query.

## Navigation

expo-router uses file-based routing. Rules:

- Every `.tsx` file in `app/` becomes a route
- `app/(tabs)/` is the tab navigator group
- **Never create `app/(tabs)/index.tsx`** — it conflicts with `app/index.tsx`
- Use `router.push()` for forward navigation, `router.replace()` for redirects
- Use `<Redirect href="/" />` in layouts for auth guards (not `useEffect` + `router.replace`)

## Styling

- **Always use `StyleSheet.create`** — never inline style objects
- **Always use `useResponsive()`** for fonts and spacing — never hardcode pixel values
- **Dark theme only** — use colors from `constants/colors.ts`

```typescript
// Good
<Text style={[styles.title, { fontSize: r.fs(18) }]}>Hello</Text>

// Bad
<Text style={{ fontSize: 18, color: "white" }}>Hello</Text>
```

## API Calls

- **Always use `apiFetch()`** from `lib/api.ts` — handles auth headers and base URL
- **Never use raw `fetch()`** for backend calls
- **Wrap in React Query** for data fetching
- **Handle errors** with try-catch

```typescript
// Good — data fetching
const { data, isLoading } = useQuery({
  queryKey: ["agent-me"],
  queryFn: getMe,
});

// Good — mutation
const res = await apiFetch("/agents/profile/", {
  method: "PATCH",
  body: JSON.stringify({ name: "John" }),
});
```

## Icons

- **Always use `<Icon>`** component from `components/Icon.tsx`
- **Never import Ionicons** or other icon libraries directly
- To add a new icon: add SVG path data to `ICON_PATHS` in `Icon.tsx`

```typescript
// Good
import Icon from "@/components/Icon";
<Icon name="home" size={24} color={Colors.primary} />

// Bad
import { Ionicons } from "@expo/vector-icons";
<Ionicons name="home" size={24} color="green" />
```

## Error Handling

- **Async operations:** Always wrap in try-catch
- **Component trees:** Use `ErrorBoundary` wrapper
- **API errors:** Check `res.ok` before parsing JSON
- **User feedback:** Show Alert or inline error text — never fail silently

## Auth Guards

- **In layouts:** Use `<Redirect href="/" />` when `!isAuthenticated`
- **In NavGuard:** Use `useEffect` with `router.replace()` for complex redirect logic
- **Never redirect in component body** — always in useEffect or via Redirect component

## Imports Order

Group imports in this order, separated by blank lines:

1. React / React Native
2. Expo packages
3. Third-party packages
4. Local imports (`@/`)

```typescript
import React, { useState } from "react";
import { View, Text } from "react-native";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useQuery } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { getMe } from "@/lib/api";
import Icon from "@/components/Icon";
```

## Query Keys

Use consistent query keys across the app:

| Key | Data | Used in |
|-----|------|---------|
| `["agent-me"]` | Agent profile | Home, Profile, Submit Lead |
| `["network"]` | Referral network | Network tab |
| `["clients"]` | Client list | Clients tab |
| `["config"]` | App configuration | ConfigContext |

## Debugging

- **No `console.log` in production** — remove before committing
- **Use React DevTools** for component inspection
- **Use `npx expo start --web`** for quick UI iteration (API calls will fail due to CORS)
- **Test native features** (push, Google sign-in) only in APK builds
