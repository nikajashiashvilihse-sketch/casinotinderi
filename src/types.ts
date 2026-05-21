export interface CasinoBonusDetails {
  wagering: string;
  min_deposit: string;
  expiry: string;
  max_cashout: string;
  vip_cashback?: string;
  free_spins?: string;
}

export interface FeaturedGame {
  name: string;
  category: string;
  thumbnail: string;
  multiplier: string;
}

export interface Casino {
  id: string;
  slug: string;
  name: string;
  logo: string;
  affiliate_url: string;
  affiliate_id: string;
  click_param_name: string;
  commission_type: "CPA" | "RevShare" | "Hybrid";
  cpa_value: number;
  revshare_percent: number;
  is_featured: boolean;
  is_active: boolean;
  
  // Design details
  rating: number; // e.g. 4.8
  liked_percent: number; // e.g. 84
  live_players: number; // e.g. 2341
  bonus_headline: string; // e.g. "200% up to $1,000 + 100 Free Spins"
  bonus_details: CasinoBonusDetails;
  
  game_types: string[]; // e.g. ["Slots", "Live Casino", "Crash Games", "Sports Betting"]
  payment_methods: string[]; // e.g. ["Crypto", "Credit Card", "PayPal", "Bank Transfer"]
  country_licenses: string[]; // e.g. ["Germany", "United Kingdom", "Canada", "Australia", "Brazil"]
  tags: string[]; // e.g. ["New", "Hot Today"]
  withdrawal_speed: {
    crypto: string;
    ewallet: string;
    card: string;
    bank: string;
  };
  customer_support: string[];
  vip_overview: string;
  app_info: string;
  featured_games: FeaturedGame[];
}

export interface AffiliateClick {
  id: string;
  click_id: string;
  casino_id: string;
  casino_slug: string;
  casino_name: string;
  user_country: string;
  user_preferences: {
    games: string[];
    payments: string[];
    bonusType: string;
  };
  source_page: string;
  source_position: string;
  user_agent: string;
  ip_hash: string;
  clicked_at: string;
  converted: boolean;
  converted_at?: string;
  conversion_value?: number;
}

export interface Conversion {
  id: string;
  click_id: string;
  casino_id: string;
  casino_name: string;
  conversion_type: "registration" | "deposit" | "qualified_deposit";
  commission_amount: number;
  received_at: string;
  raw_postback: any;
}

export interface UserReview {
  id: string;
  casino_id: string;
  username: string;
  country: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown supported
  cover_image: string;
  published_at: string;
  author: string;
  read_time: string;
  category: string;
  related_casinos: string[]; // array of casino slugs or ids
}

export interface OnboardingPreferences {
  games: string[];
  payments: string[];
  bonusType: string;
}
