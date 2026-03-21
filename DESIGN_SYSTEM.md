# Rivo Partners Mobile — Design System

## Color Palette

Defined in `constants/colors.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#000000` | Screen backgrounds |
| `surface` | `#18181B` | Cards, inputs, elevated surfaces |
| `border` | `#27272A` | Card borders, dividers |
| `borderLight` | `#3F3F46` | Lighter borders (checkboxes) |
| `primary` | `#00D084` | Buttons, links, accents, active states |
| `primaryDark` | `#00A86B` | Pressed states |
| `text` | `#FFFFFF` | Primary text |
| `textSecondary` | `#A1A1AA` | Subtitles, descriptions |
| `textMuted` | `#71717A` | Hints, placeholders, disabled |
| `danger` | `#EF4444` | Error states, delete buttons |
| `whatsapp` | `#25D366` | WhatsApp branding |
| `overlay` | `rgba(0,0,0,0.6)` | Modal overlays |

**Theme:** Dark only. No light mode.

## Typography

**Font family:** Inter (loaded via `expo-font`)

| Weight | Import | Usage |
|--------|--------|-------|
| 400 | `Inter_400Regular` | Body text, descriptions |
| 500 | `Inter_500Medium` | Labels, subtitles, tab bar |
| 600 | `Inter_600SemiBold` | Section titles, card titles |
| 700 | `Inter_700Bold` | Headlines, hero text, amounts |

### Responsive Font Scaling

Use `useResponsive()` hook — never hardcode font sizes:

```typescript
const r = useResponsive();
// r.fs(16) returns scaled font size based on screen width
// Base: 375px → scales 0.88x (small) to 1.15x (large)
// Minimum: 12px
```

## Spacing

Use `useResponsive()` for all spacing:

```typescript
const r = useResponsive();
// r.sp(24) — scaled spacing value
// r.screenPadding — horizontal page padding (12-20px)
// r.cardPadding — card internal padding (12-16px)
// r.sectionGap — gap between sections (20-32px)
```

## Components

### Icon
SVG-based icon component. All icons defined in `components/Icon.tsx`.

```typescript
import Icon from "@/components/Icon";
<Icon name="home" size={24} color={Colors.primary} />
```

### Cards
```typescript
{
  backgroundColor: Colors.surface,  // #18181B
  borderRadius: 12,
  borderWidth: 1,
  borderColor: Colors.border,       // #27272A
  padding: r.sp(16),
}
```

### Buttons

**Primary CTA (white):**
```typescript
{
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  height: 56,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}
```

**Disabled state:** `opacity: 0.4`
**Pressed state:** `opacity: 0.85, transform: [{ scale: 0.98 }]`

### Text Inputs
```typescript
{
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 12,
  height: 56,
  paddingHorizontal: 16,
  color: Colors.text,
  fontSize: r.fs(15),
}
```

## Layout Patterns

### Screen Structure
```typescript
<View style={{ flex: 1, backgroundColor: Colors.background }}>
  <View style={stickyHeader}>  {/* Fixed top section */}
  <ScrollView>                  {/* Scrollable content */}
</View>
```

### Safe Areas
Always use `useSafeAreaInsets()` for top/bottom padding:
```typescript
const insets = useSafeAreaInsets();
// paddingTop: insets.top + r.sp(16)
// paddingBottom: insets.bottom + TAB_BAR_HEIGHT
```

### Tab Bar
- Height: 84px
- Background: `#000000`
- Active color: `#00D084`
- Inactive color: `#71717A`
- Border top: `1px #27272A`

## Status Badges

Used in Clients screen for deal stages:

| Status | Color |
|--------|-------|
| New / Pending | `#71717A` (gray) |
| Contacted | `#3B82F6` (blue) |
| Submitted | `#8B5CF6` (purple) |
| Pre-Approved | `#F59E0B` (amber) |
| FOL Received | `#06B6D4` (cyan) |
| Disbursed | `#00D084` (green) |
| Declined | `#EF4444` (red) |
