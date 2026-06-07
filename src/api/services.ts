import { api } from './client';
import type {
  Agent, Quest, Prospect, LeaderboardEntry, HallOfFameEntry,
  AcademyModule, Badge, ChatMessage, Notification, AgentStats,
  RegisterData,
} from '../types';

// ─── Auth ───────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; data: Agent }>('/auth/login', { email, password }),

  register: (data: RegisterData) =>
    api.post<{ token: string; data: Agent }>('/auth/register', data),

  logout: () => api.post<void>('/auth/logout'),

  refresh: () => api.post<{ token: string }>('/auth/refresh'),

  me: () => api.get<{ data: Agent }>('/auth/me'),

  updateProfile: (data: Partial<Agent>) =>
    api.put<{ data: Agent }>('/auth/profile', data),

  changePassword: (current_password: string, new_password: string) =>
    api.put<void>('/auth/password', { current_password, new_password }),

  forgotPassword: (email: string) =>
    api.post<void>('/auth/forgot-password', { email }),
};

// ─── Home ────────────────────────────────────────────
export const homeApi = {
  hallOfFame: (period?: string) =>
    api.get<{ data: HallOfFameEntry[] }>(`/home/hall-of-fame?${new URLSearchParams(period ? { period } : {})}`),

  leaderboard: (params?: { type?: string; period?: string; cabang?: string; team?: string }) =>
    api.get<{ data: LeaderboardEntry[] }>(`/home/leaderboard?${new URLSearchParams(params as Record<string, string>)}`),

  eventQuests: () => api.get<{ data: Quest[] }>('/home/event-quests'),

  dailyQuests: () => api.get<{ data: Quest[] }>('/home/quests/daily'),

  myProgress: () => api.get<{ data: { level: number; xp: number; xp_next: number; tier: string } }>('/home/my-progress'),

  stats: () => api.get<{ data: AgentStats }>('/home/stats'),

  recentActivity: () => api.get<{ data: { id: number; type: string; description: string; created_at: string }[] }>('/home/recent-activity'),
};

// ─── Quest ────────────────────────────────────────────
export const questApi = {
  list: (params?: { category?: string; search?: string }) =>
    api.get<{ data: Quest[] }>(`/quests?${new URLSearchParams(params as Record<string, string>)}`),

  detail: (id: number) => api.get<{ data: Quest }>(`/quests/${id}`),

  claim: (id: number) => api.post<void>(`/quests/${id}/claim`),

  history: () => api.get<{ data: Quest[] }>('/quests/history'),
};

// ─── Listing ──────────────────────────────────────────
export const listingApi = {
  list: (params?: { status?: string; sort?: string; search?: string }) =>
    api.get<{ data: import('../types').ListingItem[] }>(`/listings?${new URLSearchParams(params as Record<string, string>)}`),

  create: (data: FormData) => api.upload<{ id: number }>('/listings', data),

  update: (id: number, data: FormData) =>
    api.upload<void>(`/listings/${id}`, data, 'PUT'),

  delete: (id: number) => api.delete<void>(`/listings/${id}`),
};

// ─── Prospect ─────────────────────────────────────────
export const prospectApi = {
  list: (search?: string) =>
    api.get<{ data: Prospect[] }>(`/prospects?${new URLSearchParams(search ? { search } : {})}`),

  create: (data: Omit<Prospect, 'id' | 'created_at'>) =>
    api.post<{ id: number }>('/prospects', data),

  update: (id: number, data: Partial<Prospect>) =>
    api.put<void>(`/prospects/${id}`, data),

  updateStatus: (id: number, status: Prospect['status']) =>
    api.put<void>(`/prospects/${id}/status`, { status }),

  delete: (id: number) => api.delete<void>(`/prospects/${id}`),
};

// ─── Recruit ───────────────────────────────────────────
export const recruitApi = {
  list: () => api.get<{ data: import('../types').Agent[] }>('/recruits'),

  create: (data: { name: string; email: string; phone?: string }) =>
    api.post<{ id: number }>('/recruits', data),
};

// ─── Academy ──────────────────────────────────────────
export const academyApi = {
  modules: (params?: { category?: string; search?: string }) =>
    api.get<{ data: AcademyModule[] }>(`/academy/modules?${new URLSearchParams(params as Record<string, string>)}`),

  detail: (id: number) => api.get<{ data: AcademyModule }>(`/academy/modules/${id}`),

  updateProgress: (id: number, progress: number) =>
    api.post<void>(`/academy/modules/${id}/progress`, { progress }),

  myProgress: () => api.get<{ data: { completed: number; total: number; total_xp: number } }>('/academy/progress'),
};

// ─── Badge ────────────────────────────────────────────
export const badgeApi = {
  list: (params?: { category?: string; search?: string }) =>
    api.get<{ data: Badge[] }>(`/badges?${new URLSearchParams(params as Record<string, string>)}`),

  detail: (id: number) => api.get<{ data: Badge }>(`/badges/${id}`),

  myBadges: () => api.get<{ data: Badge[] }>('/user/badges'),

  setFeatured: (badgeIds: number[]) =>
    api.put<void>('/user/badges/featured', { badge_ids: badgeIds }),
};

// ─── Profile ──────────────────────────────────────────
export const profileApi = {
  detail: () => api.get<{ data: Agent }>('/profile'),

  hofHistory: () => api.get<{ data: HallOfFameEntry[] }>('/profile/hof-history'),

  share: () => api.get<{ data: { url: string; qr: string } }>('/profile/share'),
};

// ─── Notification ─────────────────────────────────────
export const notificationApi = {
  list: (page = 1) => api.get<{ data: Notification[]; meta: { current_page: number; last_page: number } }>(`/notifications?${new URLSearchParams({ page: String(page) })}`),

  markRead: (id: number) => api.put<void>(`/notifications/${id}/read`),

  markAllRead: () => api.put<void>('/notifications/read-all'),

  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};

// ─── Activity ─────────────────────────────────────────
export const activityApi = {
  list: (params?: { type?: string; page?: number }) =>
    api.get<{ data: { id: number; type: string; description: string; created_at: string }[] }>(
      `/activities?${new URLSearchParams(params as Record<string, string>)}`
    ),
};

// ─── Chat ─────────────────────────────────────────────
export const chatApi = {
  conversations: () => api.get<{ data: { id: number; name: string; last_message: string; unread: number }[] }>('/chats'),

  messages: (id: number) => api.get<{ data: ChatMessage[] }>(`/chats/${id}`),

  sendMessage: (id: number, message: string) =>
    api.post<{ data: ChatMessage }>(`/chats/${id}/messages`, { message }),

  createConversation: (name: string) =>
    api.post<{ id: number }>('/chats', { name }),
};

// ─── Leaderboard ──────────────────────────────────────
export const leaderboardApi = {
  list: (params?: { type?: string; period?: string; branch_id?: number; team_id?: number }) =>
    api.get<{ data: LeaderboardEntry[] }>(`/leaderboard?${new URLSearchParams(params as Record<string, string>)}`),
};

// ─── Agent ────────────────────────────────────────────
export const agentApi = {
  detail: (id: number) => api.get<{ data: Agent }>(`/agents/${id}`),
};

// ─── Referral ─────────────────────────────────────────
export const referralApi = {
  myInfo: () => api.get<{ data: { code: string; total_recruits: number; total_commission: number } }>('/referrals'),
};

// ─── Support ──────────────────────────────────────────
export const supportApi = {
  transactions: () => api.get<{ data: import('../types').Agent[] }>('/transactions'),

  links: () => api.get<{ data: { faq: string; contact: string; report: string } }>('/support/links'),

  sendMessage: (message: string) => api.post<void>('/support/messages', { message }),
};

// ─── Poster ───────────────────────────────────────────
export const posterApi = {
  generate: () => api.post<{ data: { html: string; qr: string } }>('/poster/generate'),
};
