export interface Agent {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  level: number;
  tier: 'Rookie' | 'Junior' | 'Senior' | 'Elite' | 'Super Elite' | 'LOT Legendary';
  xp: number;
  xp_next_level: number;
  total_commission: number;
  total_properties: number;
  total_transactions: number;
  rank: number;
  cabang: string;
  team: string;
  joined_at: string;
  referral_code: string;
  badges: Badge[];
  featured_badges: Badge[];
  total_recruit: number;
  training_completed: number;
  is_legendary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earned_at: string | null;
  unlock_condition?: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'event' | 'achievement' | 'producer' | 'marketing' | 'skill' | 'closing';
  xp_reward: number;
  badge_reward: Badge | null;
  status: 'Active' | 'Completed' | 'Locked';
  progress: number;
  target: number;
  ends_at: string | null;
}

export interface Prospect {
  id: number;
  name: string;
  phone: string;
  status: 'New Lead' | 'Follow Up' | 'Showing' | 'Akad' | 'Deal' | 'Lost';
  source: string;
  notes: string;
  created_at: string;
  next_action?: string;
  next_date?: string;
  next_time?: string;
  reminders?: ProspectReminder[];
}

export interface ProspectReminder {
  id: number;
  action: string;
  date: string;
  time: string;
  created_at: string;
}

export interface ProspectActivity {
  id: number;
  prospect_id: number;
  action: string;
  from_status: string;
  to_status: string;
  note: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  agent: Pick<Agent, 'id' | 'name' | 'username' | 'avatar' | 'level' | 'tier'>;
  total_commission: number;
  total_transactions: number;
  period: 'Bulanan' | 'All-Time';
}

export interface HallOfFameEntry {
  id: number;
  agent: Pick<Agent, 'id' | 'name' | 'username' | 'avatar' | 'level' | 'tier'>;
  total_commission: number;
  total_transactions: number;
  period: string;
  rank: number;
  is_rising_star: boolean;
  is_admin_pick: boolean;
}

export interface AcademyModule {
  id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  duration_minutes: number;
  completed: boolean;
  locked: boolean;
  youtube_url?: string;
  thumbnail_url?: string;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string | null;
  message: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: 'quest' | 'badge' | 'level_up' | 'achievement' | 'system' | 'event';
  category: 'action_required' | 'achievement' | 'community' | 'company';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface AgentStats {
  total_listings: number;
  active_listings: number;
  total_prospects: number;
  converted_prospects: number;
  total_commission: number;
  monthly_commission: number;
  day_streak: number;
  quests_completed: number;
  modules_completed: number;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant =
  | 'Active' | 'Cancelled' | 'Pending' | 'Completed' | 'Locked'
  | 'Converted' | 'New' | 'Contacted' | 'Lost' | 'Legendary';

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  name: string;
  last_message: string;
  unread: number;
  updated_at: string;
  announcement?: string;
}

export interface TransactionItem {
  id?: number;
  property?: string;
  date?: string;
  commission?: string;
  status?: string;
}

export interface ListingItem {
  id: number;
  title?: string;
  owner_name?: string;
  address?: string;
  location?: string;
  price?: string;
  status?: string;
  beds?: number;
  baths?: number;
  size?: string;
  land_size?: string;
  building_size?: string;
  floor?: string;
  notes?: string;
  type?: string;
  category?: string;
  phone?: string;
  created_at?: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  cabang: string;
  phone?: string;
  referral_code?: string;
}
