'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    supportTitle: 'Support PhotoFlow AI',
    supportSub: 'Réponse sous 24h maximum',
    inputPlaceholder: 'Écrivez votre message ici...',
    welcomeMessage: 'Bonjour ! Comment pouvons-nous vous aider aujourd’hui ? Notre support s’engage à vous répondre sous 24h maximum. N’hésitez pas à nous poser vos questions !',
    send: 'Envoyer',
    online: 'En ligne',
    newReplyNotification: 'Nouvelle réponse du support (24h max)',
  },
  en: {
    supportTitle: 'PhotoFlow AI Support',
    supportSub: 'Response within 24 hours max',
    inputPlaceholder: 'Type your message here...',
    welcomeMessage: 'Hello! How can we help you today? Our support team commits to reply within 24 hours at the latest. Feel free to ask your questions!',
    send: 'Send',
    online: 'Online',
    newReplyNotification: 'New reply from support (24h max)',
  }
};

export default function ChatWidget() {
  const pathname = usePathname();
  const lang = useLanguage();
  const t = translations[lang] || translations.fr;

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        checkUnreadMessages(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkUnreadMessages(session.user.id);
      } else {
        setUser(null);
        setMessages([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if there are any unread messages from support
  const checkUnreadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pf_support_messages')
        .select('id')
        .eq('user_id', userId)
        .neq('sender_id', userId)
        .eq('is_read', false)
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Error checking unread messages:', err);
    }
  };

  // Fetch messages and subscribe to changes when chat is opened
  useEffect(() => {
    if (!user || !isOpen) return;

    fetchMessages(user.id);
    markAllAsRead(user.id);

    // Setup realtime subscription
    const channel = supabase
      .channel(`support_chat_user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pf_support_messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          
          if (payload.new.sender_id !== user.id) {
            markAllAsRead(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pf_support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    } catch (err) {
      console.error('Error fetching support messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      await supabase
        .from('pf_support_messages')
        .update({ is_read: true })
        .eq('user_id', userId)
        .neq('sender_id', userId)
        .eq('is_read', false);
      
      setHasUnread(false);
    } catch (err) {
      console.error('Error marking support messages as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic UI update
    const tempId = crypto.randomUUID();
    const optimisticMsg = {
      id: tempId,
      user_id: user.id,
      sender_id: user.id,
      content: messageText,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { data, error } = await supabase
        .from('pf_support_messages')
        .insert({
          user_id: user.id,
          sender_id: user.id,
          content: messageText,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with actual DB message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? data : msg))
      );
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message if insert failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(messageText); // restore text
    }
  };

  // Hide the support chat on admin pages or if not logged in
  if (!user || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[99] font-body-md select-none">
      {/* Chat panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] sm:w-[380px] h-[500px] glass-panel rounded-2xl border border-outline-variant/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary/90 to-primary-container/90 border-b border-outline-variant/30 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-xl">support_agent</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-high" title={t.online}></span>
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-wide leading-tight">{t.supportTitle}</h4>
                <p className="text-[10px] text-zinc-200/80 mt-0.5">{t.supportSub}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-background/90 flex flex-col">
            {loading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 my-auto">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">forum</span>
                <p className="text-xs text-zinc-300 font-medium bg-surface-container-high/40 p-4 rounded-2xl border border-outline-variant/20 shadow-sm leading-relaxed">
                  {t.welcomeMessage}
                </p>
              </div>
            ) : (
              <>
                {/* System welcome message at top */}
                <div className="flex gap-2 max-w-[85%] self-start">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-outline-variant/30 flex-shrink-0">
                    <span className="material-symbols-outlined text-[13px] text-primary">support_agent</span>
                  </div>
                  <div className="bg-zinc-800 border border-outline-variant/20 text-on-surface text-xs p-3 rounded-2xl rounded-tl-none shadow-sm leading-relaxed">
                    {t.welcomeMessage}
                  </div>
                </div>

                {/* DB Messages */}
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user.id;
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[85%] ${
                        isOwn ? 'self-end flex-row-reverse' : 'self-start'
                      }`}
                    >
                      {!isOwn && (
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-outline-variant/30 flex-shrink-0">
                          <span className="material-symbols-outlined text-[13px] text-primary">support_agent</span>
                        </div>
                      )}
                      <div>
                        <div
                          className={`text-xs p-3 rounded-2xl shadow-sm leading-relaxed break-words whitespace-pre-wrap ${
                            isOwn
                              ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-tr-none'
                              : 'bg-zinc-800 border border-outline-variant/20 text-on-surface rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className={`block text-[9px] text-zinc-500 font-mono mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-outline-variant/30 bg-surface-container-low/50 flex gap-2 items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="flex-grow bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                newMessage.trim()
                  ? 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-md shadow-primary/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              }`}
              title={t.send}
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Notification bubble next to toggle button */}
      {hasUnread && !isOpen && (
        <div className="absolute bottom-2 right-16 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 whitespace-nowrap animate-bounce flex items-center gap-2 pointer-events-none">
          <span className="material-symbols-outlined text-sm">support_agent</span>
          <span>{t.newReplyNotification}</span>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer relative group border border-white/10"
        title="Support client"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform duration-300">
          {isOpen ? 'close' : 'chat'}
        </span>

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-background"></span>
          </span>
        )}
      </button>
    </div>
  );
}
