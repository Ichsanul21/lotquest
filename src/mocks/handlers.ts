import { http, HttpResponse, delay } from 'msw';
import {
  mockAgent, mockHallOfFame, mockQuests, mockProspects, mockModules,
  mockNotifications, mockChatMessages, mockStats, mockActivities,
  mockBadges, mockLeaderboard,
} from './data';

const BASE = 'http://localhost:8000/api';

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, async () => {
    await delay(300);
    return HttpResponse.json({ token: 'mock-token', data: mockAgent });
  }),

  http.post(`${BASE}/auth/register`, async () => {
    await delay(300);
    return HttpResponse.json({ token: 'mock-token', data: mockAgent });
  }),

  http.post(`${BASE}/auth/logout`, async () => {
    await delay(100);
    return HttpResponse.json({ message: 'Logged out' });
  }),

  http.post(`${BASE}/auth/refresh`, async () => {
    await delay(100);
    return HttpResponse.json({ token: 'mock-token-refreshed' });
  }),

  http.get(`${BASE}/auth/me`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockAgent });
  }),

  http.put(`${BASE}/auth/profile`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockAgent });
  }),

  http.put(`${BASE}/auth/password`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Password updated' });
  }),

  http.post(`${BASE}/auth/forgot-password`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Reset link sent' });
  }),

  // Home
  http.get(`${BASE}/home/hall-of-fame`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockHallOfFame });
  }),

  http.get(`${BASE}/home/leaderboard`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockLeaderboard });
  }),

  http.get(`${BASE}/home/event-quests`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockQuests.filter(q => q.type === 'producer' && q.id === 1) });
  }),

  http.get(`${BASE}/home/quests/daily`, async () => {
    await delay(200);
    const dailyTypes = ['producer', 'marketing'];
    return HttpResponse.json({ data: mockQuests.filter(q => dailyTypes.includes(q.type)) });
  }),

  http.get(`${BASE}/home/my-progress`, async () => {
    await delay(200);
    return HttpResponse.json({ data: { level: mockAgent.level, xp: mockAgent.xp, xp_next: mockAgent.xp_next_level, tier: mockAgent.tier } });
  }),

  http.get(`${BASE}/home/stats`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockStats });
  }),

  http.get(`${BASE}/home/recent-activity`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockActivities.slice(0, 10) });
  }),

  // Quests
  http.get(`${BASE}/quests`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    let data = mockQuests;
    if (category) data = data.filter(q => q.type === category);
    return HttpResponse.json({ data });
  }),

  http.get(`${BASE}/quests/:id`, async ({ params }) => {
    await delay(200);
    const quest = mockQuests.find(q => q.id === Number(params.id));
    return HttpResponse.json({ data: quest || mockQuests[0] });
  }),

  http.post(`${BASE}/quests/:id/claim`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Quest claimed!' });
  }),

  http.get(`${BASE}/quests/history`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockQuests.filter(q => q.status === 'Completed') });
  }),

  // Listings
  http.get(`${BASE}/listings`, async () => {
    await delay(200);
    return HttpResponse.json({ data: [] });
  }),

  http.post(`${BASE}/listings`, async () => {
    await delay(200);
    return HttpResponse.json({ id: 99 });
  }),

  http.put(`${BASE}/listings/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Updated' });
  }),

  http.delete(`${BASE}/listings/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Deleted' });
  }),

  // Prospects
  http.get(`${BASE}/prospects`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockProspects });
  }),

  http.post(`${BASE}/prospects`, async () => {
    await delay(200);
    return HttpResponse.json({ id: 99 });
  }),

  http.put(`${BASE}/prospects/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Updated' });
  }),

  http.put(`${BASE}/prospects/:id/status`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Status updated' });
  }),

  http.delete(`${BASE}/prospects/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Deleted' });
  }),

  // Recruits
  http.get(`${BASE}/recruits`, async () => {
    await delay(200);
    return HttpResponse.json({ data: [] });
  }),

  http.post(`${BASE}/recruits`, async () => {
    await delay(200);
    return HttpResponse.json({ id: 99 });
  }),

  // Academy
  http.get(`${BASE}/academy/modules`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockModules });
  }),

  http.get(`${BASE}/academy/modules/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockModules[0] });
  }),

  http.post(`${BASE}/academy/modules/:id/progress`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Progress updated' });
  }),

  http.get(`${BASE}/academy/progress`, async () => {
    await delay(200);
    return HttpResponse.json({ data: { completed: 3, total: 10, total_xp: 450 } });
  }),

  // Badges
  http.get(`${BASE}/badges`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockBadges });
  }),

  http.get(`${BASE}/badges/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockBadges[0] });
  }),

  http.get(`${BASE}/user/badges`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockBadges.filter(b => b.earned_at) });
  }),

  http.put(`${BASE}/user/badges/featured`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Featured badges updated' });
  }),

  // Profile
  http.get(`${BASE}/profile`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockAgent });
  }),

  http.get(`${BASE}/profile/hof-history`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockHallOfFame.slice(0, 3) });
  }),

  http.get(`${BASE}/profile/share`, async () => {
    await delay(200);
    return HttpResponse.json({ data: { url: 'https://lotquest.com/profile/johndoe', qr: 'data:image/svg+xml;base64,...' } });
  }),

  // Notifications
  http.get(`${BASE}/notifications`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockNotifications, meta: { current_page: 1, last_page: 1 } });
  }),

  http.put(`${BASE}/notifications/:id/read`, async () => {
    await delay(100);
    return HttpResponse.json({ message: 'Marked read' });
  }),

  http.put(`${BASE}/notifications/read-all`, async () => {
    await delay(100);
    return HttpResponse.json({ message: 'All marked read' });
  }),

  http.get(`${BASE}/notifications/unread-count`, async () => {
    await delay(100);
    return HttpResponse.json({ count: 2 });
  }),

  // Activities
  http.get(`${BASE}/activities`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockActivities });
  }),

  // Chat
  http.get(`${BASE}/chats`, async () => {
    await delay(200);
    return HttpResponse.json({ data: [{ id: 1, name: 'Group Chat', last_message: 'Halo semua!', unread: 2, announcement: 'Selamat datang di grup LOT Quest! Jangan lupa cek Hall of Fame bulan ini.' }] });
  }),

  http.get(`${BASE}/chats/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockChatMessages });
  }),

  http.post(`${BASE}/chats/:id/messages`, async () => {
    await delay(200);
    return HttpResponse.json({ data: { id: 99, sender_id: 1, sender_name: 'John Doe', sender_avatar: null, message: 'Halo!', created_at: new Date().toISOString() } });
  }),

  http.post(`${BASE}/chats`, async () => {
    await delay(200);
    return HttpResponse.json({ id: 99 });
  }),

  // Leaderboard
  http.get(`${BASE}/leaderboard`, async () => {
    await delay(200);
    return HttpResponse.json({ data: mockLeaderboard });
  }),

  // Referral
  http.get(`${BASE}/referrals`, async () => {
    await delay(200);
    return HttpResponse.json({ data: { code: 'ABCD12', total_recruits: 3, total_commission: 150000 } });
  }),

  // Transactions
  http.get(`${BASE}/transactions`, async () => {
    await delay(200);
    return HttpResponse.json({ data: [] });
  }),

  // Support
  http.get(`${BASE}/support/links`, async () => {
    await delay(200);
    return HttpResponse.json({ data: { faq: '/support', contact: 'https://wa.me/628123456789?text=Halo%20LOT%20Quest', report: 'https://forms.google.com/...', commission_form: 'https://forms.google.com/...', drive: 'https://drive.google.com/...' } });
  }),

  http.post(`${BASE}/support/messages`, async () => {
    await delay(300);
    return HttpResponse.json({ message: 'Pesan berhasil dikirim' });
  }),

  // Poster
  http.post(`${BASE}/poster/generate`, async () => {
    await delay(500);
    return HttpResponse.json({ data: { html: '<div>Poster</div>', qr: 'data:image/svg+xml;base64,...' } });
  }),

  // Agent Detail
  http.get(`${BASE}/agents/:id`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ data: { ...mockAgent, id: Number(params.id), name: `Agent #${params.id}` } });
  }),
];
