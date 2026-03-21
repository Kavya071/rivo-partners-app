import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

const BASE_WIDTH = 375;
const SMALL_BREAKPOINT = 360;
const LARGE_BREAKPOINT = 414;

export function useResponsive() {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    // Use square root scaling — dampens growth on large screens
    // 375px → 1.0, 414px → 1.05, 430px → 1.07, 320px → 0.92
    const rawScale = width / BASE_WIDTH;
    const scale = Math.sqrt(rawScale);
    const isSmall = width < SMALL_BREAKPOINT;
    const isLarge = width >= LARGE_BREAKPOINT;

    const hp = (pct: number) => Math.round(width * pct / 100);

    // Spacing: grows slowly — max 1.08x even on large phones
    const sp = (base: number) => Math.round(base * Math.min(Math.max(scale, 0.9), 1.08));

    // Font size: barely grows — max 1.05x, shrinks gently on small screens
    const fs = (base: number) => {
      const scaled = base * Math.min(Math.max(scale, 0.9), 1.05);
      return Math.max(12, Math.round(scaled));
    };

    const cardPadding = isSmall ? 12 : isLarge ? 18 : 16;
    const screenPadding = Math.max(16, Math.min(hp(6), 24));
    const cardGap = isSmall ? 12 : 16;
    const sectionGap = isSmall ? 20 : isLarge ? 28 : 24;
    const iconTextGap = isSmall ? 12 : isLarge ? 16 : 14;

    // Max font size multiplier for accessibility — prevents system font scaling from making text huge
    const maxFontScale = 1.1;

    return {
      width,
      scale,
      isSmall,
      isLarge,
      hp,
      sp,
      fs,
      cardPadding,
      screenPadding,
      cardGap,
      sectionGap,
      iconTextGap,
      maxFontScale,
    };
  }, [width]);
}
