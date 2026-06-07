import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { chatApi } from '../../api/services';
import type { ChatMessage, ChatConversation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Send, MessageCircle, AlertCircle, Megaphone } from 'lucide-react';

export default function Chat() {
  const { agent } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inbox, setInbox] = useState<ChatConversation[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const listRef = useRef<HTMLDivElement>(null);

  const chatMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [convRes, msgRes] = await Promise.allSettled([
        chatApi.conversations(),
        activeChat ? chatApi.messages(activeChat) : Promise.resolve({ data: [] }),
      ]);
      if (!chatMountedRef.current) return;
      if (convRes.status === 'fulfilled') setInbox(convRes.value.data);
      if (msgRes.status === 'fulfilled') setMessages(msgRes.value.data);
    } catch (e) {
      if (!chatMountedRef.current) return;
      setError(t('chat.toast.error_load'));
    } finally {
      if (chatMountedRef.current) setLoading(false);
    }
  }, [activeChat]);

  useEffect(() => {
    chatMountedRef.current = true;
    setLoading(true);
    fetchData();
    return () => { chatMountedRef.current = false; };
  }, [fetchData]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    try {
      const res = await chatApi.sendMessage(activeChat, input.trim());
      setMessages(prev => [...prev, res.data]);
      setInput('');
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch (e) {
      showToast('error', t('chat.toast.error_send'));
    }
  };

  return (
    <>
      <Header title={activeChat ? t('chat.title') : 'Percakapan'} />
      <PullToRefresh onRefresh={fetchData}>
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4 flex-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-40'} rounded-2xl`} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-zinc-400">{error}</p>
            </Card>
          </div>
        ) : !activeChat && inbox.length > 0 ? (
          /* Inbox view */
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {inbox.find(c => c.announcement) && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFE082]/10 border border-[#FFE082]/20 mb-2">
                <Megaphone className="w-4 h-4 text-[#FFE082] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#FFE082] mb-0.5">{t('chat.announcement.title')}</p>
                  <p className="text-[11px] text-zinc-300">{inbox.find(c => c.announcement)?.announcement}</p>
                </div>
              </div>
            )}
            {inbox.map((conv) => (
              <Card key={conv.id} onClick={() => setActiveChat(conv.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{conv.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{conv.last_message}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <MessageCircle className="w-12 h-12 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500">{t('chat.empty')}</p>
          </div>
        ) : (
          /* Messages view */
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
            {/* Announcement */}
            {inbox.find(c => c.id === activeChat)?.announcement && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFE082]/10 border border-[#FFE082]/20">
                <Megaphone className="w-4 h-4 text-[#FFE082] shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-300">{inbox.find(c => c.id === activeChat)?.announcement}</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender_id === agent?.id ? 'justify-end' : m.sender_id === 0 ? 'justify-center' : 'justify-start'}`}>
                {m.sender_id === 0 ? (
                  <span className="text-[10px] text-zinc-500 bg-white/5 px-3 py-1 rounded-full">{m.message}</span>
                ) : (
                  <div className={`max-w-[80%] ${m.sender_id === agent?.id ? 'gold-gradient text-[#0B0B0F] rounded-2xl rounded-br-md' : 'glass-card rounded-2xl rounded-bl-md'} px-4 py-2.5`}>
                    {m.sender_id !== agent?.id && (
                      <p className="text-[10px] font-semibold text-[#FFE082] mb-1">{m.sender_name}</p>
                    )}
                    <p className={`text-sm ${m.sender_id === agent?.id ? 'text-[#0B0B0F]' : 'text-white'}`}>{m.message}</p>
                    <p className={`text-[10px] mt-1 ${m.sender_id === agent?.id ? 'text-[#0B0B0F]/60' : 'text-zinc-500'}`}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/10 bg-[#0B0B0F]">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 disabled:opacity-40" disabled={!input.trim()}>
              <Send className="w-4 h-4 text-[#0B0B0F]" />
            </button>
          </div>
        </div>
      </div>
      </PullToRefresh>
    </>
  );
}
