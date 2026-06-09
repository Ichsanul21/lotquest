import type { Agent, Badge, Quest, Prospect, LeaderboardEntry, HallOfFameEntry, AcademyModule, Notification, ChatMessage, AgentStats } from '../types';

export const mockAgent: Agent = {
  id: 1,
  name: 'John Doe',
  username: 'johndoe',
  avatar: null,
  level: 12,
  tier: 'Senior',
  xp: 450,
  xp_next_level: 1000,
  total_commission: 750000,
  total_properties: 5,
  total_transactions: 12,
  rank: 5,
  cabang: 'Jakarta Pusat',
  team: 'Alpha',
  joined_at: '2025-01-15T00:00:00Z',
  referral_code: 'ABCD12',
  badges: [
    { id: 1, name: 'First Sale', description: 'Transaksi pertama', icon: 'award', rarity: 'Common', earned_at: '2025-02-01', unlock_condition: 'Lakukan transaksi pertama Anda' },
    { id: 2, name: 'Top Referrer', description: 'Referensi 5 agen', icon: 'users', rarity: 'Rare', earned_at: '2025-03-15', unlock_condition: 'Referensikan 5 agen baru' },
    { id: 3, name: 'Property Master', description: 'Transaksi 50 properti', icon: 'home', rarity: 'Epic', earned_at: null, unlock_condition: 'Selesaikan 50 transaksi properti' },
    { id: 4, name: 'Social Star', description: '100 followers Instagram', icon: 'instagram', rarity: 'Common', earned_at: null, unlock_condition: 'Capai 100 followers di Instagram' },
  ],
  featured_badges: [
    { id: 1, name: 'First Sale', description: 'Transaksi pertama', icon: 'award', rarity: 'Common', earned_at: '2025-02-01', unlock_condition: 'Lakukan transaksi pertama Anda' },
    { id: 2, name: 'Top Referrer', description: 'Referensi 5 agen', icon: 'users', rarity: 'Rare', earned_at: '2025-03-15', unlock_condition: 'Referensikan 5 agen baru' },
  ],
  total_recruit: 3,
  training_completed: 8,
  is_legendary: false,
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2026-06-06T00:00:00Z',
};

export const mockHallOfFame: HallOfFameEntry[] = [
  { id: 1, agent: { id: 2, name: 'Budi Santoso', username: 'budisantoso', avatar: null, level: 18, tier: 'Junior' }, total_commission: 2500000, total_transactions: 20, period: '2026-06', rank: 1, is_rising_star: false, is_admin_pick: true },
  { id: 2, agent: { id: 3, name: 'Siti Rahma', username: 'sitirahma', avatar: null, level: 15, tier: 'Junior' }, total_commission: 1800000, total_transactions: 15, period: '2026-06', rank: 2, is_rising_star: false, is_admin_pick: false },
  { id: 3, agent: { id: 4, name: 'Ahmad Fauzi', username: 'ahmadfauzi', avatar: null, level: 10, tier: 'Rookie' }, total_commission: 1200000, total_transactions: 10, period: '2026-06', rank: 3, is_rising_star: true, is_admin_pick: false },
  { id: 4, agent: { id: 5, name: 'Dewi Lestari', username: 'dewilestari', avatar: null, level: 14, tier: 'Junior' }, total_commission: 980000, total_transactions: 8, period: '2026-06', rank: 4, is_rising_star: false, is_admin_pick: false },
  { id: 5, agent: { id: 6, name: 'Rudi Hermawan', username: 'rudihermawan', avatar: null, level: 11, tier: 'Rookie' }, total_commission: 850000, total_transactions: 7, period: '2026-06', rank: 5, is_rising_star: false, is_admin_pick: false },
];

export const mockQuests: Quest[] = [
  { id: 1, title: 'New Listing', description: 'Upload 1 listing baru (3/hari)', type: 'producer', xp_reward: 100, badge_reward: null, status: 'Active', progress: 2, target: 3, ends_at: '2026-06-07T00:00:00Z' },
  { id: 2, title: 'New Recruit', description: 'Rekrut agen baru', type: 'producer', xp_reward: 5000, badge_reward: null, status: 'Active', progress: 0, target: 1, ends_at: null },
  { id: 3, title: 'Video Content', description: 'Upload video promosi (1/hari)', type: 'marketing', xp_reward: 100, badge_reward: null, status: 'Active', progress: 0, target: 1, ends_at: '2026-06-07T00:00:00Z' },
  { id: 4, title: 'Listing Promotion', description: 'Promosikan listing (3/hari)', type: 'marketing', xp_reward: 100, badge_reward: null, status: 'Active', progress: 1, target: 3, ends_at: '2026-06-07T00:00:00Z' },
  { id: 5, title: 'Complete Module', description: 'Selesaikan 1 module academy', type: 'skill', xp_reward: 200, badge_reward: null, status: 'Active', progress: 0, target: 1, ends_at: null },
  { id: 6, title: 'Event Attendance', description: 'Hadiri event training', type: 'skill', xp_reward: 200, badge_reward: null, status: 'Active', progress: 0, target: 1, ends_at: '2026-06-13T00:00:00Z' },
  { id: 7, title: 'New Prospect', description: 'Dapatkan prospek baru', type: 'closing', xp_reward: 100, badge_reward: null, status: 'Active', progress: 3, target: 5, ends_at: null },
  { id: 8, title: 'Jual Apartemen', description: 'Closing penjualan apartemen', type: 'closing', xp_reward: 10000, badge_reward: null, status: 'Active', progress: 0, target: 1, ends_at: null },
];

export const mockProspects: Prospect[] = [
  { id: 1, name: 'Budi Santoso', phone: '0812-3456-7890', status: 'New Lead', source: 'Instagram', notes: 'Mencari sewa rumah PIK budget 100 juta setahun', created_at: '2026-06-04T00:00:00Z' },
  { id: 2, name: 'Andi Wijaya', phone: '0813-3456-7890', status: 'Follow Up', source: 'Walk-in', notes: 'Mau lihat apartemen SCBD 2BR', created_at: '2026-06-03T00:00:00Z' },
  { id: 3, name: 'Jessica Tan', phone: '0814-3456-7890', status: 'Showing', source: 'Referral', notes: 'Sudah survey show unit, minat', created_at: '2026-06-01T00:00:00Z' },
  { id: 4, name: 'Dedi Kurniawan', phone: '0815-3456-7890', status: 'Akad', source: 'Website', notes: 'Proses akad minggu depan', created_at: '2026-05-28T00:00:00Z' },
  { id: 5, name: 'Siti Rahma', phone: '0816-3456-7890', status: 'Deal', source: 'Realtor', notes: 'Deal cluster Mewah BSD', created_at: '2026-05-20T00:00:00Z' },
  { id: 6, name: 'Eko Saputra', phone: '0817-3456-7890', status: 'Lost', source: 'Website', notes: 'Batal beli karena KPR ditolak', created_at: '2026-05-15T00:00:00Z' },
];

export const mockModules: AcademyModule[] = [
  { id: 1, title: 'Produk Perumahan Subsidi', description: 'Pelajari produk perumahan subsidi', category: 'Product Knowledge', xp_reward: 50, duration_minutes: 15, completed: true, locked: false, youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 2, title: 'Teknik Closing Efektif', description: 'Teknik closing yang efektif', category: 'Sales Skill', xp_reward: 100, duration_minutes: 25, completed: false, locked: false, youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 3, title: 'Marketing Digital', description: 'Digital marketing untuk agent', category: 'Digital Marketing', xp_reward: 75, duration_minutes: 20, completed: false, locked: false, youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 4, title: 'Dokumen Legal', description: 'Dokumen legal & perjanjian', category: 'Legal', xp_reward: 80, duration_minutes: 30, completed: false, locked: true, youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

export const mockNotifications: Notification[] = [
  { id: 1, type: 'quest', category: 'action_required', title: 'Follow Up Hari Ini', body: 'Klien: Budi Santoso — Jam Target: 10.00 WIB', read: false, created_at: '2026-06-06T08:00:00Z' },
  { id: 2, type: 'quest', category: 'action_required', title: 'Showing Hari Ini', body: 'Klien: Andi Wijaya — Rumah, Jam Target: 15.00 WIB', read: false, created_at: '2026-06-06T07:00:00Z' },
  { id: 3, type: 'system', category: 'action_required', title: 'Listing Belum Diperbarui', body: 'Listing PIK 2 belum diperbarui selama 14 hari.', read: true, created_at: '2026-06-05T00:00:00Z' },
  { id: 4, type: 'badge', category: 'achievement', title: 'Badge Unlocked!', body: 'Selamat! Anda mendapatkan badge Listing Supplier.', read: false, created_at: '2026-06-05T10:00:00Z' },
  { id: 5, type: 'level_up', category: 'achievement', title: 'Level Up!', body: 'Selamat! Anda naik ke level Junior Agent.', read: true, created_at: '2026-06-04T00:00:00Z' },
  { id: 6, type: 'achievement', category: 'achievement', title: 'Hall of Fame', body: 'Anda masuk Top 5 Recruit — August 2026.', read: true, created_at: '2026-06-03T00:00:00Z' },
  { id: 7, type: 'achievement', category: 'community', title: 'Michael T. dapat Billionaire Club!', body: 'Rekan Anda berhasil mendapatkan lencana Mythic tertinggi.', read: false, created_at: '2026-06-06T09:00:00Z' },
  { id: 8, type: 'achievement', category: 'community', title: 'Jessica L. dapat Perfectionist Agent', body: 'Rekan Anda berhasil mendapatkan lencana Legendary.', read: false, created_at: '2026-06-06T08:30:00Z' },
  { id: 9, type: 'achievement', category: 'community', title: 'Kevin H. dapat The Professor', body: 'Rekan Anda berhasil mendapatkan lencana prestasi.', read: true, created_at: '2026-06-05T00:00:00Z' },
  { id: 10, type: 'system', category: 'company', title: 'Pesan dari Admin', body: 'Mohon agent lebih responsive dalam membalas pesan customer. Terima kasih!', read: false, created_at: '2026-06-06T10:00:00Z' },
  { id: 11, type: 'system', category: 'company', title: 'Target Q3', body: 'Pesan dari Management. Target Q3 telah diumumkan. Yuk capai bersama!', read: false, created_at: '2026-06-05T00:00:00Z' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: 1, sender_id: 0, sender_name: 'System', sender_avatar: null, message: 'Selamat datang di chat LOT Quest!', created_at: '2026-06-06T07:00:00Z' },
  { id: 2, sender_id: 2, sender_name: 'Budi Santoso', sender_avatar: null, message: 'Halo semua, ada yang punya info properti BSD?', created_at: '2026-06-06T07:30:00Z' },
  { id: 3, sender_id: 1, sender_name: 'John Doe', sender_avatar: null, message: 'Saya ada listing cluster baru, minat?', created_at: '2026-06-06T07:35:00Z' },
];

export const mockStats: AgentStats = {
  total_listings: 12,
  active_listings: 8,
  total_prospects: 24,
  converted_prospects: 6,
  total_commission: 750000,
  monthly_commission: 250000,
  day_streak: 5,
  quests_completed: 24,
  modules_completed: 3,
};

export const mockActivities = [
  { id: 1, type: 'quest', description: 'Menyelesaikan quest "Survey Properti Baru"', created_at: '2026-06-06T06:00:00Z' },
  { id: 2, type: 'badge', description: 'Mendapatkan lencana "First Sale"', created_at: '2026-06-05T10:00:00Z' },
  { id: 3, type: 'transaction', description: 'Transaksi properti Cluster Mewah BSD', created_at: '2026-06-04T14:00:00Z' },
  { id: 4, type: 'level', description: 'Naik ke Level 12', created_at: '2026-06-04T00:00:00Z' },
  { id: 5, type: 'prospect', description: 'Prospek baru: Andi Pratama (Instagram)', created_at: '2026-06-03T00:00:00Z' },
];

export const mockBadges: Badge[] = [
  { id: 1, name: 'First Sale', description: 'Transaksi pertama', icon: 'award', rarity: 'Common', earned_at: '2025-02-01' },
  { id: 2, name: 'Top Referrer', description: 'Referensi 5 agen', icon: 'users', rarity: 'Rare', earned_at: '2025-03-15' },
  { id: 3, name: 'Property Master', description: 'Transaksi 50 properti', icon: 'home', rarity: 'Epic', earned_at: null },
  { id: 4, name: 'Millionaire', description: 'Komisi total 100 juta', icon: 'dollar', rarity: 'Legendary', earned_at: null },
  { id: 5, name: 'Speed Closer', description: 'Closing dalam 1 hari', icon: 'zap', rarity: 'Rare', earned_at: '2025-04-01' },
  { id: 6, name: 'Consistent', description: 'Aktif 30 hari berturut-turut', icon: 'calendar', rarity: 'Common', earned_at: '2025-05-01' },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, agent: { id: 2, name: 'Budi Santoso', username: 'budisantoso', avatar: null, level: 18, tier: 'Junior' }, total_commission: 2500000, total_transactions: 20, period: 'Bulanan' },
  { rank: 2, agent: { id: 3, name: 'Siti Rahma', username: 'sitirahma', avatar: null, level: 15, tier: 'Junior' }, total_commission: 1800000, total_transactions: 15, period: 'Bulanan' },
  { rank: 3, agent: { id: 4, name: 'Ahmad Fauzi', username: 'ahmadfauzi', avatar: null, level: 10, tier: 'Rookie' }, total_commission: 1200000, total_transactions: 10, period: 'Bulanan' },
  { rank: 4, agent: { id: 5, name: 'Dewi Lestari', username: 'dewilestari', avatar: null, level: 14, tier: 'Junior' }, total_commission: 980000, total_transactions: 8, period: 'Bulanan' },
  { rank: 5, agent: { id: 1, name: 'John Doe', username: 'johndoe', avatar: null, level: 12, tier: 'Senior' }, total_commission: 750000, total_transactions: 12, period: 'Bulanan' },
];
