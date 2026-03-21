export const API_BASE_URL =
  "https://rivo-partners-backend-331738587654.asia-southeast1.run.app/api/v1";

export interface CountryEntry {
  code: string;
  country: string;
  flag: string;
  digits: number;
}

export const COUNTRY_CODES: CountryEntry[] = [
  { code: "+971", country: "UAE", flag: "\u{1F1E6}\u{1F1EA}", digits: 9 },
  { code: "+91", country: "India", flag: "\u{1F1EE}\u{1F1F3}", digits: 10 },
  { code: "+44", country: "UK", flag: "\u{1F1EC}\u{1F1E7}", digits: 10 },
  { code: "+1", country: "US", flag: "\u{1F1FA}\u{1F1F8}", digits: 10 },
  { code: "+966", country: "Saudi", flag: "\u{1F1F8}\u{1F1E6}", digits: 9 },
  { code: "+968", country: "Oman", flag: "\u{1F1F4}\u{1F1F2}", digits: 8 },
  { code: "+974", country: "Qatar", flag: "\u{1F1F6}\u{1F1E6}", digits: 8 },
  { code: "+973", country: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}", digits: 8 },
  { code: "+965", country: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}", digits: 8 },
  { code: "+92", country: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}", digits: 10 },
  { code: "+63", country: "Philippines", flag: "\u{1F1F5}\u{1F1ED}", digits: 10 },
];

export const CLIENT_STATUSES = [
  "SUBMITTED",
  "CONTACTED",
  "QUALIFIED",
  "SUBMITTED_TO_BANK",
  "PREAPPROVED",
  "FOL_RECEIVED",
  "DISBURSED",
  "DECLINED",
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
