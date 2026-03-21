import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getAppConfig, HomeBanner } from "@/lib/api";

interface ConfigData {
  COMMISSION: {
    MIN_PERCENT: number;
    MAX_PERCENT: number;
    AVG_PAYOUT: number;
  };
  REFERRAL_BONUS: {
    AMOUNTS: number[];
    TOTAL_POTENTIAL: number;
  };
  NEW_AGENT_BONUS: {
    AMOUNTS: number[];
    TOTAL_POTENTIAL: number;
  };
  LINKS: {
    WHATSAPP_PERSONAL: string;
    WHATSAPP_BUSINESS: string;
  };
  MESSAGES: {
    SHARE_TEXT: string;
  };
  HOME_BANNERS: HomeBanner[];
}

const DEFAULTS: ConfigData = {
  COMMISSION: {
    MIN_PERCENT: 0.45,
    MAX_PERCENT: 0.6,
    AVG_PAYOUT: 9000,
  },
  REFERRAL_BONUS: {
    AMOUNTS: [500, 500, 1000],
    TOTAL_POTENTIAL: 2000,
  },
  NEW_AGENT_BONUS: {
    AMOUNTS: [500, 500, 1000],
    TOTAL_POTENTIAL: 2000,
  },
  LINKS: {
    WHATSAPP_PERSONAL: "https://wa.me/971545079577",
    WHATSAPP_BUSINESS: "https://wa.me/971545079577",
  },
  MESSAGES: {
    SHARE_TEXT:
      "Hey, I'm using Rivo to earn mortgage commissions. Join here: ",
  },
  HOME_BANNERS: [],
};

interface ConfigContextValue {
  config: ConfigData;
  isLoaded: boolean;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULTS,
  isLoaded: false,
});

function buildConfig(
  data: Record<string, unknown> = {},
): ConfigData {
  const min =
    (data.commission_min_percent as number) ?? DEFAULTS.COMMISSION.MIN_PERCENT;
  const max =
    (data.commission_max_percent as number) ?? DEFAULTS.COMMISSION.MAX_PERCENT;
  const avg = (data.avg_payout as number) ?? DEFAULTS.COMMISSION.AVG_PAYOUT;
  const bonuses =
    (data.referrer_bonuses as number[]) ?? DEFAULTS.REFERRAL_BONUS.AMOUNTS;
  const newAgentBonuses =
    (data.new_agent_bonuses as number[]) ?? DEFAULTS.NEW_AGENT_BONUS.AMOUNTS;

  return {
    COMMISSION: {
      MIN_PERCENT: min,
      MAX_PERCENT: max,
      AVG_PAYOUT: avg,
    },
    REFERRAL_BONUS: {
      AMOUNTS: bonuses,
      TOTAL_POTENTIAL: bonuses.reduce((a: number, b: number) => a + b, 0),
    },
    NEW_AGENT_BONUS: {
      AMOUNTS: newAgentBonuses,
      TOTAL_POTENTIAL: newAgentBonuses.reduce((a: number, b: number) => a + b, 0),
    },
    LINKS: {
      WHATSAPP_PERSONAL:
        (data.whatsapp_personal as string) ?? DEFAULTS.LINKS.WHATSAPP_PERSONAL,
      WHATSAPP_BUSINESS:
        (data.whatsapp_business as string) ?? DEFAULTS.LINKS.WHATSAPP_BUSINESS,
    },
    MESSAGES: {
      SHARE_TEXT:
        (data.referral_share_msg as string) ?? DEFAULTS.MESSAGES.SHARE_TEXT,
    },
    HOME_BANNERS: (data.home_banners as HomeBanner[]) ?? [],
  };
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigData>(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getAppConfig()
      .then((data) => {
        setConfig(buildConfig(data as unknown as Record<string, unknown>));
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoaded }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigData {
  return useContext(ConfigContext).config;
}
