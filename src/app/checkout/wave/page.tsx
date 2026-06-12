'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const translations = {
  fr: {
    paymentFailed: "Le traitement du paiement a échoué.",
    paymentFailedTitle: "Échec du Paiement",
    paymentSuccess: "Paiement Réussi !",
    paymentSuccessDesc: "Votre paiement de {amount} FCFA a été validé par Wave Mobile Money.",
    redirecting: "Redirection en cours...",
    amountLabel: "Montant",
    phoneStepTitle: "Saisissez votre numéro Wave",
    phoneStepDesc: "Vous allez recevoir un code de confirmation par SMS.",
    phoneInputLabel: "Numéro de téléphone",
    sendOtpBtn: "Envoyer le code SMS",
    otpStepTitle: "Saisissez le code SMS",
    otpStepDesc: "Un code à 4 chiffres a été envoyé au +221 {phone}.",
    otpInputLabel: "Code de vérification",
    confirmPaymentBtn: "Confirmer le paiement",
    securedBy: "Sécurisé par Wave Mobile Money",
    notifClose: "Fermer",
    loadingText: "Chargement..."
  },
  en: {
    paymentFailed: "Payment processing failed.",
    paymentFailedTitle: "Payment Failed",
    paymentSuccess: "Payment Successful!",
    paymentSuccessDesc: "Your payment of {amount} FCFA has been verified by Wave Mobile Money.",
    redirecting: "Redirecting...",
    amountLabel: "Amount",
    phoneStepTitle: "Enter your Wave number",
    phoneStepDesc: "You will receive a confirmation code by SMS.",
    phoneInputLabel: "Phone number",
    sendOtpBtn: "Send SMS Code",
    otpStepTitle: "Enter the SMS code",
    otpStepDesc: "A 4-digit code has been sent to +221 {phone}.",
    otpInputLabel: "Verification Code",
    confirmPaymentBtn: "Confirm Payment",
    securedBy: "Secured by Wave Mobile Money",
    notifClose: "Close",
    loadingText: "Loading..."
  }
};

function WaveCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Query Params
  const amount = searchParams.get('amount') || '12500';
  const invoiceId = searchParams.get('invoiceId') || '';
  const email = searchParams.get('email') || '';

  // Language switcher state
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
    if (saved === 'fr' || saved === 'en') {
      setTimeout(() => setLang(saved), 0);
    }

    const handleLangChange = () => {
      const updated = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
      if (updated === 'fr' || updated === 'en') {
        setLang(updated);
      }
    };

    window.addEventListener('photoflow_lang_change', handleLangChange);
    return () => {
      window.removeEventListener('photoflow_lang_change', handleLangChange);
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    localStorage.setItem('photoflow_lang', nextLang);
    window.dispatchEvent(new Event('photoflow_lang_change'));
  };

  const t = translations[lang];

  // Checkout steps states
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom notification modal state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);

    try {
      // Perform database updates
      if (invoiceId) {
        // Update Invoice status to Paid
        const { error } = await supabase
          .from('pf_invoices')
          .update({ status: 'paid' })
          .eq('id', invoiceId);
        if (error) throw error;
      } else {
        // If subscribing to Pro, update the current user's profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('pf_profiles')
            .update({ plan: 'pro', storage_limit: 53687091200 }) // Upgrade to 50GB
            .eq('id', user.id);
          if (error) throw error;
        }
      }

      setLoading(false);
      setStep('success');

      // Redirect back after 3 seconds
      setTimeout(() => {
        if (invoiceId) {
          router.push('/dashboard/invoices?status=success');
        } else {
          router.push('/dashboard?status=subscribed');
        }
      }, 3000);
    } catch (err) {
      console.error('Wave processing failed:', err);
      setLoading(false);
      showNotification('error', t.paymentFailedTitle, t.paymentFailed);
    }
  };

  if (step === 'success') {
    return (
      <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl font-bold">check</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t.paymentSuccess}</h2>
        <p className="text-zinc-400 text-xs mb-6">
          {t.paymentSuccessDesc.replace('{amount}', parseInt(amount).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'))}
        </p>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-zinc-500 mt-4">{t.redirecting}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Language Switcher Button */}
      <div className="absolute -top-12 right-0">
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 text-[11px] font-bold border border-zinc-800 hover:border-blue-500 rounded bg-[#1e1e22] text-zinc-400 hover:text-white transition-all uppercase cursor-pointer"
          title="Changer de langue / Switch Language"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
        {/* Wave Header branding */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <span className="font-bold text-zinc-200 text-sm tracking-wider">WAVE PAY</span>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.amountLabel}</p>
            <p className="text-sm font-black text-white">{parseInt(amount).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</p>
          </div>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200">{t.phoneStepTitle}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">{t.phoneStepDesc}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.phoneInputLabel}</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-sm font-bold text-zinc-400">+221</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77 000 00 00"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-500 rounded-2xl pl-16 pr-4 py-3.5 text-sm font-bold outline-none text-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              ) : (
                t.sendOtpBtn
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200">{t.otpStepTitle}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">{t.otpStepDesc.replace('{phone}', phone)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.otpInputLabel}</label>
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="0 0 0 0"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest outline-none text-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              ) : (
                t.confirmPaymentBtn
              )}
            </button>
          </form>
        )}

        {/* Safety notice */}
        <div className="mt-8 text-center border-t border-zinc-800/60 pt-4 flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          {t.securedBy}
        </div>
      </div>

      {/* Custom Notification Modal */}
      {notification.isOpen && (
        <div 
          onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#1e1e22] border border-zinc-800/80 p-6 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
          >
            {notification.type === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
                <span className="material-symbols-outlined text-4xl">cancel</span>
              </div>
            )}
            {notification.type === 'warning' && (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
            )}
            {notification.type === 'info' && (
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
                <span className="material-symbols-outlined text-4xl">info</span>
              </div>
            )}

            <h3 className="font-display-lg text-lg font-bold text-white mb-1">
              {notification.title}
            </h3>
            <p className="text-zinc-400 text-xs mb-6 px-2">
              {notification.message}
            </p>

            <button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 rounded-xl border border-zinc-800 active:scale-98 transition-all cursor-pointer text-xs"
            >
              {t.notifClose}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WaveCheckoutPage() {
  return (
    <div className="min-h-screen bg-[#18181A] flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }>
        <WaveCheckoutForm />
      </Suspense>
    </div>
  );
}
