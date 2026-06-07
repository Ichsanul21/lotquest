import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { supportApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import type { TransactionItem } from '../../types';
import { HelpCircle, MessageCircle, Bug, ChevronDown, ChevronUp, ExternalLink, FileText, AlertCircle } from 'lucide-react';

export default function Support() {
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [links, setLinks] = useState<{ faq: string; contact: string; report: string; commission_form?: string; drive?: string } | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const faqs = [
    { q: t('support.faq_items.q1'), a: t('support.faq_items.a1') },
    { q: t('support.faq_items.q2'), a: t('support.faq_items.a2') },
    { q: t('support.faq_items.q3'), a: t('support.faq_items.a3') },
    { q: t('support.faq_items.q4'), a: t('support.faq_items.a4') },
  ];

  const fetchSupportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [linksRes, txRes] = await Promise.allSettled([
        supportApi.links(),
        supportApi.transactions(),
      ]);
      if (!mountedRef.current) return;
      if (linksRes.status === 'fulfilled') setLinks(linksRes.value.data);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('support.toast.error_load'));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [t]);

  const [sending, setSending] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await supportApi.sendMessage(message);
      showToast('success', t('support.toast.success_send'));
      setMessage('');
    } catch {
      showToast('error', t('support.toast.error_send'));
    } finally {
      setSending(false);
    }
  }, [message, sending, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSupportData();
    return () => { mountedRef.current = false; };
  }, [fetchSupportData]);

  return (
    <>
      <Header title={t('support.title')} showBack />
      <PullToRefresh onRefresh={fetchSupportData}>
      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
          </Card>
        )}

        {/* FAQ */}
        {!loading && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('support.faq')}</h3>
                <p className="text-xs text-zinc-500">{t('support.description')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    className="w-full flex items-center justify-between py-3 text-sm text-left text-white"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    {faq.q}
                    {expanded === i ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </button>
                  {expanded === i && (
                    <p className="text-xs text-zinc-400 pb-3 -mt-1">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {!loading && (
          <div className="space-y-3">
            <Card>
              <a href={links?.contact || 'https://wa.me/6281234567890'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{t('support.contact')}</h3>
                  <p className="text-xs text-zinc-500">{t('support.contact_chat')}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </Card>

            <Card>
              <a href={links?.commission_form || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{t('support.claim_commission')}</h3>
                  <p className="text-xs text-zinc-500">{t('support.commission_form')}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </Card>

            <Card>
              <a href={links?.drive || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{t('support.marketing_materials')}</h3>
                  <p className="text-xs text-zinc-500">{t('support.drive')}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </Card>
          </div>
        )}

        {/* My Transactions */}
        {!loading && (
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">{t('support.transactions')}</h3>
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id || Math.random()} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white">{tx.property || t('support.transaction')}</p>
                      <p className="text-[10px] text-zinc-500">{tx.date || '-'}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">{tx.commission || '-'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">{t('support.no_transactions')}</p>
            )}
          </Card>
        )}

        {/* Contact Form */}
        {!loading && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('support.contact_form.title')}</h3>
                <p className="text-xs text-zinc-500">{t('support.contact_form.description')}</p>
              </div>
            </div>
            <textarea
              className="input-field w-full min-h-[100px] resize-none"
              placeholder={t('support.contact_form.placeholder')}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <Button className="w-full mt-3" disabled={!message.trim()} loading={sending} onClick={handleSendMessage}>{t('common.send')}</Button>
          </Card>
        )}

        {/* Report */}
        {!loading && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{t('support.report')}</h3>
                <p className="text-xs text-zinc-500">{t('support.report_description')}</p>
              </div>
              <a href={links?.report || '#'} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost">{t('support.report_button')}</Button>
              </a>
            </div>
          </Card>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}
