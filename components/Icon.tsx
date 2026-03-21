import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Path, Circle, Rect, Polyline, Line } from "react-native-svg";

type IconRenderer = (size: number, color: string) => React.ReactNode;

const ICON_PATHS = {
  home: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M400 179V64h-64v72" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "home-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M400 179V64h-64v72" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  briefcase: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Rect x="32" y="128" width="448" height="320" rx="48" ry="48" fill={color} />
      <Path d="M144 128V96a32 32 0 0132-32h160a32 32 0 0132 32v32" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M480 240H32" stroke="#000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <Path d="M256 280v32" stroke="#000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </Svg>
  ),
  "briefcase-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Rect x="32" y="128" width="448" height="320" rx="48" ry="48" stroke={color} strokeWidth="32" strokeLinejoin="round" fill="none" />
      <Path d="M144 128V96a32 32 0 0132-32h160a32 32 0 0132 32v32M480 240H32M256 280v32" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  people: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M336 256c-20.56 0-40.44-9.18-56-25.84-15.13-16.25-24.37-37.92-26-61-1.74-24.62 5.77-47.26 21.14-63.76S312 80 336 80c23.83 0 45.38 9.06 60.7 25.52 15.47 16.62 23 39.22 21.26 63.63-1.67 23.11-10.9 44.77-26 61C376.44 246.82 356.57 256 336 256z" />
      <Path d="M467.83 432H204.18a27.71 27.71 0 01-22-10.67 30.22 30.22 0 01-5.26-25.79c8.42-33.81 29.28-61.85 60.32-81.08C264.79 297.4 299.86 288 336 288c36.85 0 71 9 98.71 26.05 31.11 19.13 52 47.33 60.38 81.55a30.27 30.27 0 01-5.32 25.78A27.68 27.68 0 01467.83 432z" />
      <Path d="M147 260c-35.19 0-66.13-32.72-69-72.93-1.42-20.6 5-39.65 18-53.62 12.86-13.83 31-21.45 51-21.45s38 7.66 50.93 21.57c13.1 14.08 19.5 33.09 18 53.52-2.87 40.2-33.8 72.91-68.93 72.91z" />
      <Path d="M212.66 291.45c-17.59-8.6-40.42-12.82-65.65-12.82-29.46 0-58.07 7.68-80.57 21.62-25.51 15.83-42.67 38.88-49.6 66.71a27.39 27.39 0 004.79 23.36A25.32 25.32 0 0041.72 400h111.83" />
    </Svg>
  ),
  "people-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M402 168c-2.93 40.67-33.1 72-66 72s-63.12-31.32-66-72c-3-42.31 26.37-72 66-72s69 30.46 66 72z" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M336 304c-65.17 0-127.84 32.37-143.54 95.41-2.08 8.34 3.15 16.59 11.72 16.59h263.65c8.57 0 13.77-8.25 11.72-16.59C463.85 336.36 401.18 304 336 304z" stroke={color} strokeWidth="32" strokeMiterlimit="10" />
      <Path d="M200 185.94c-2.34 32.48-26.72 58.06-53 58.06s-50.7-25.57-53-58.06C91.61 152.15 115.34 128 147 128s55.39 24.77 53 57.94z" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M206 306c-18.05-8.27-37.93-11.45-59-11.45-52 0-102.1 25.85-114.65 76.2-1.65 6.64 2.53 13.25 9.37 13.25H154" stroke={color} strokeWidth="32" strokeLinecap="round" strokeMiterlimit="10" />
    </Svg>
  ),
  person: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M256 256a112 112 0 10-112-112 112 112 0 00112 112zm0 32c-79.5 0-191.64 38.87-192 160a16 16 0 0016 16h352a16 16 0 0016-16c-.36-121.13-112.5-160-192-160z" />
    </Svg>
  ),
  "person-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55.18 35.28-96 88-96s92 42.02 88 96z" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M256 304c-87.41 0-159.36 48.28-168 160a8 8 0 008 8h320a8 8 0 008-8c-8.64-111.72-80.59-160-168-160z" stroke={color} strokeWidth="32" strokeMiterlimit="10" />
    </Svg>
  ),
  flash: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M315.27 33L96 304h128l-31.51 173.23a2.36 2.36 0 002.33 2.77 2.36 2.36 0 001.89-.95L416 208H288l31.66-173.25a2.45 2.45 0 00-2.44-2.75 2.42 2.42 0 00-1.95 1z" />
    </Svg>
  ),
  "trending-up": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Polyline points="352,144 464,144 464,256" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M48 368l144-144 96 96 160-160" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "arrow-forward": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M268 112l144 144-144 144M392 256H100" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "chevron-forward": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M184 112l144 144-144 144" stroke={color} strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "chevron-down": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M112 184l144 144 144-144" stroke={color} strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "chevron-up": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M112 328l144-144 144 144" stroke={color} strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  search: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" stroke={color} strokeWidth="32" strokeMiterlimit="10" />
      <Line x1="338.29" y1="338.29" x2="448" y2="448" stroke={color} strokeWidth="32" strokeLinecap="round" />
    </Svg>
  ),
  "copy-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Rect x="128" y="128" width="336" height="336" rx="57" ry="57" stroke={color} strokeWidth="32" strokeLinejoin="round" />
      <Path d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "share-social": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Circle cx="128" cy="256" r="48" fill={color} stroke={color} strokeWidth="32" />
      <Circle cx="384" cy="112" r="48" fill={color} stroke={color} strokeWidth="32" />
      <Circle cx="384" cy="400" r="48" fill={color} stroke={color} strokeWidth="32" />
      <Line x1="169.83" y1="231.73" x2="342.17" y2="135.27" stroke={color} strokeWidth="32" />
      <Line x1="169.83" y1="280.27" x2="342.17" y2="376.73" stroke={color} strokeWidth="32" />
    </Svg>
  ),
  "share-social-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Circle cx="128" cy="256" r="48" stroke={color} strokeWidth="32" />
      <Circle cx="384" cy="112" r="48" stroke={color} strokeWidth="32" />
      <Circle cx="384" cy="400" r="48" stroke={color} strokeWidth="32" />
      <Line x1="169.83" y1="231.73" x2="342.17" y2="135.27" stroke={color} strokeWidth="32" />
      <Line x1="169.83" y1="280.27" x2="342.17" y2="376.73" stroke={color} strokeWidth="32" />
    </Svg>
  ),
  "arrow-back": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M244 400L100 256l144-144M120 256h292" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  close: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M368 368L144 144M368 144L144 368" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  checkmark: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M416 128L192 384l-96-96" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "checkmark-circle": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm108.25 138.29l-134.4 160a16 16 0 01-12 5.71h-.27a16 16 0 01-11.89-5.3l-57.6-64a16 16 0 1123.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0124.5 20.58z" />
    </Svg>
  ),
  "shield-checkmark": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M479.07 111.36a16 16 0 00-13.15-14.74c-86.5-15.81-122.53-44.35-132.25-53.63a16 16 0 00-19.53-.56C284.43 62.59 256.33 80 256 80s-28.43-17.41-58.14-37.57a16 16 0 00-19.53.56c-9.72 9.28-45.75 37.82-132.25 53.63a16 16 0 00-13.15 14.74c-3.85 61.11 4.36 118.05 24.43 169.24A349.47 349.47 0 00129 361.5c26.59 31.83 59.66 57.65 98.29 76.75a16.18 16.18 0 0014.42 0c38.63-19.1 71.7-44.92 98.29-76.75a349.47 349.47 0 0071.65-80.94c20.07-51.19 28.28-108.13 24.42-169.2zm-175.2 123l-89.6 89.6a16 16 0 01-22.63 0l-44.8-44.8a16 16 0 0122.63-22.63L203 289.89l78.29-78.28a16 16 0 1122.63 22.62z" />
    </Svg>
  ),
  "shield-checkmark-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M336 176L225.2 304 176 255.8" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M463.1 112.37C373.68 96.33 336.71 84.45 256 48c-80.71 36.45-117.68 48.33-207.1 64.37C32.7 369.13 240.58 457.79 256 464c15.42-6.21 223.3-94.87 207.1-351.63z" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "log-out-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M304 336v40a40 40 0 01-40 40H104a40 40 0 01-40-40V136a40 40 0 0140-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  "trash-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="80" y1="112" x2="432" y2="112" stroke={color} strokeWidth="32" strokeLinecap="round" />
      <Path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  chatbubble: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M76.83 480a25.2 25.2 0 01-17.64-7.17A24.12 24.12 0 0152 455.81V392c-12.94-21-23.18-46.41-29-77C16.73 280.14 16 245.87 16 224.14 16 113.55 115.39 32 240 32s224 81.55 224 192.14S364.61 416.29 240 416.29a346.12 346.12 0 01-55.44-4.45C160 432.59 127.61 457 99.2 474.27A29.37 29.37 0 0176.83 480z" />
    </Svg>
  ),
  "logo-whatsapp": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M414.73 97.1A222.14 222.14 0 00256.94 32C141 32 46.73 126.27 46.73 242.22a209.23 209.23 0 0028.13 105.17L32 480l133.59-35a209.85 209.85 0 00100.44 25.37h.09C382 470.4 480 376.14 480 260.22a222.15 222.15 0 00-65.27-163.12zM256.94 438.66h-.08a174.28 174.28 0 01-88.85-24.37l-6.37-3.78L75 432.8l22.55-82.35-4.16-6.61a173.92 173.92 0 01-26.73-93.62c0-96.4 78.51-174.87 175-174.87a173.57 173.57 0 01123.56 51.23 173.53 173.53 0 0151.2 123.64c-.04 96.4-78.55 174.87-175.07 174.87zm95.91-130.89c-5.26-2.63-31.13-15.36-35.95-17.12s-8.33-2.63-11.83 2.63-13.58 17.12-16.64 20.62-6.13 3.95-11.39 1.32-22.23-8.19-42.34-26.12a158.85 158.85 0 01-29.28-36.45c-3.07-5.26-.33-8.11 2.3-10.73s5.26-6.13 7.89-9.2a35.65 35.65 0 005.27-8.82 9.72 9.72 0 00-.44-9.2c-1.32-2.63-11.83-28.52-16.21-39.05-4.26-10.26-8.6-8.87-11.83-9s-6.54-.18-10-.18a19.31 19.31 0 00-14 6.57c-4.82 5.27-18.39 18-18.39 43.86s18.83 50.87 21.46 54.38 37.07 56.62 89.81 79.4a302.85 302.85 0 0030 11.09 72.14 72.14 0 0033.11 2.08c10.1-1.51 31.13-12.73 35.51-25.02s4.39-22.83 3.07-25.02-4.82-3.51-10.08-6.14z" />
    </Svg>
  ),
  "logo-google": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M473.16 221.48l-2.26-9.59H262.46v65.76h127.19c-5.65 29.28-22.56 52.94-47.39 68.36l-.43.28 68.19 52.88.69.05c43.78-40.4 69.01-99.82 69.01-170.39 0-16.4-1.61-28.74-3.56-41.35z" />
      <Path d="M262.46 450.13c58.42 0 107.47-19.24 143.29-52.38l-68.27-52.92c-18.49 12.46-42.15 21.12-75.02 21.12-57.55 0-106.72-38.52-124.31-91.69l-.51.04-70.97 54.93-.17.48c35.64 70.8 108.85 120.42 195.96 120.42z" />
      <Path d="M138.15 274.26a130.67 130.67 0 01-7.19-43.18 132.21 132.21 0 017.33-43.54l-.12-.51-71.84-55.77-.44.21a219.45 219.45 0 00-23.43 99.61 218 218 0 0023.29 99.26z" />
      <Path d="M262.46 96.87c40.7 0 68.16 17.59 83.84 32.28l61.15-59.72c-37.14-34.55-85.58-55.7-145-55.7-87.11 0-160.32 49.62-195.96 120.42l71.41 55.49c17.73-53.17 66.9-92.77 124.56-92.77z" />
    </Svg>
  ),
  "mail-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Rect x="48" y="96" width="416" height="320" rx="40" ry="40" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="112,160 256,272 400,160" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  ),
  "alert-circle": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm0 319.91a20 20 0 1120-20 20 20 0 01-20 20zm21.72-201.15l-5.74 122a16 16 0 01-32 0l-5.74-121.94v-.05a21.74 21.74 0 1143.44 0z" />
    </Svg>
  ),
  checkbox: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <Path d="M400 48H112a64.07 64.07 0 00-64 64v288a64.07 64.07 0 0064 64h288a64.07 64.07 0 0064-64V112a64.07 64.07 0 00-64-64zm-35.75 138.29l-134.4 160a16 16 0 01-12 5.71h-.27a16 16 0 01-11.89-5.3l-57.6-64a16 16 0 1123.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0124.5 20.58z" />
    </Svg>
  ),
  "square-outline": (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path d="M416 448H96a32.09 32.09 0 01-32-32V96a32.09 32.09 0 0132-32h320a32.09 32.09 0 0132 32v320a32.09 32.09 0 01-32 32z" stroke={color} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
} satisfies Record<string, IconRenderer>;

export type IconName = keyof typeof ICON_PATHS;

export default function Icon({
  name,
  size,
  color,
  style,
}: {
  name: IconName;
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const renderIcon = ICON_PATHS[name];
  if (!renderIcon) {
    return null;
  }
  const svg = renderIcon(size, color);
  if (style) {
    return <View style={[{ width: size, height: size }, style]}>{svg}</View>;
  }
  return <>{svg}</>;
}
