'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    heroTitle: "Retouchez, organisez et livrez vos photos en quelques minutes.",
    heroSubtitle: "La plateforme pensée pour les photographes africains. Gagnez du temps sur l'editing et offrez une expérience premium à vos clients.",
    heroStartFree: "Commencer gratuitement",
    heroSeeFeatures: "Voir les fonctionnalités",
    beforeLabel: "Avant (Raw)",
    afterLabel: "Après (Retouche IA)",
    featuresTitle: "Pensé pour le workflow des photographes",
    featuresSubtitle: "Une suite d'outils professionnels pour accélérer votre productivité de la capture à la livraison.",
    bento1Title: "Retouche IA Intelligente",
    bento1Desc: "Équilibrage automatique des tons de peau et correction d'exposition optimisée pour la lumière naturelle d'Afrique. Rendu professionnel instantané.",
    bento2Title: "Livraison Sécurisée",
    bento2Desc: "Galeries clients privées protégées par mot de passe avec téléchargement haute résolution instantané (HD/Web).",
    bento2Status: "CHIFFREMENT ACTIF",
    bento3Title: "Organisation Intelligente",
    bento3Desc: "Classez vos clichés automatiquement par visage, événement ou tri intelligent des photos floues ou doublons.",
    bento3Tag1: "Face ID",
    bento3Tag2: "Tri Flou",
    bento4Title: "Facturation & Paiements Locaux",
    bento4Desc: "Envoyez des factures professionnelles ou des devis et recevez les fonds directement par Wave, Orange Money, Free Money ou carte bancaire.",
    bento4Tag1: "Intégré",
    bento4Tag2: "Mobile",
    pricingTitle: "Tarifs transparents, adaptés à vos besoins",
    pricingSubtitle: "Commencez gratuitement, passez Pro au fur et à mesure que votre activité grandit.",
    pricingFreeTitle: "Formule Gratuite",
    pricingFreePrice: "0",
    pricingPeriod: "FCFA / mois",
    pricingFreeFeature1: "7 photos retouchées / mois",
    pricingFreeFeature2: "1 galerie client active",
    pricingFreeFeature3: "Maximum 7 photos par galerie",
    pricingFreeFeature4: "Filigrane PhotoFlow AI sur les exports",
    pricingFreeCTA: "Choisir la formule Free",
    pricingProTitle: "Formule Pro",
    pricingProPrice: "12 500",
    pricingRecommended: "Recommandé",
    pricingProFeature1: "Photos retouchées illimitées",
    pricingProFeature2: "Galeries clients illimitées",
    pricingProFeature3: "Téléchargements illimités en HD",
    pricingProFeature4: "Sans filigrane & Branding personnalisé",
    pricingProFeature5: "IA avancée & Export ZIP automatique",
    pricingProCTA: "S'abonner maintenant Pro",
    faqTitle: "Questions Fréquentes",
    footerText: "© 2026 PhotoFlow AI. Conçu pour les créateurs africains.",
    footerLegal: "Mentions Légales",
    footerPrivacy: "Confidentialité",
    footerSupport: "Support client WhatsApp",
    testimonialQuote: "\"PhotoFlow AI a littéralement doublé ma productivité. Je livre mes mariages en 48h au lieu de 2 semaines. Mes clients adorent l'interface de sélection !\"",
    testimonialAuthor: "Moussa Diop",
    testimonialRole: "Photographe de Mariage, Dakar (Sénégal)"
  },
  en: {
    heroTitle: "Retouch, organize, and deliver your photos in minutes.",
    heroSubtitle: "The platform built for African photographers. Save time on editing and deliver a premium experience to your clients.",
    heroStartFree: "Start for Free",
    heroSeeFeatures: "See Features",
    beforeLabel: "Before (Raw)",
    afterLabel: "After (AI Retouch)",
    featuresTitle: "Designed for photographer workflows",
    featuresSubtitle: "A suite of professional tools to speed up your productivity from capture to delivery.",
    bento1Title: "Intelligent AI Retouching",
    bento1Desc: "Automatic skin tone balancing and exposure correction optimized for natural African light. Instant professional rendering.",
    bento2Title: "Secure Delivery",
    bento2Desc: "Private, password-protected client galleries with instant high-resolution downloads (HD/Web).",
    bento2Status: "ENCRYPTION ACTIVE",
    bento3Title: "Smart Organization",
    bento3Desc: "Classify your photos automatically by face, event, or smart filtering of blurry photos or duplicates.",
    bento3Tag1: "Face ID",
    bento3Tag2: "Blur Filter",
    bento4Title: "Invoicing & Local Payments",
    bento4Desc: "Send professional invoices or quotes and receive payments directly through Wave, Orange Money, Free Money, or bank cards.",
    bento4Tag1: "Integrated",
    bento4Tag2: "Mobile",
    pricingTitle: "Transparent pricing, tailored to your needs",
    pricingSubtitle: "Start for free, upgrade to Pro as your business grows.",
    pricingFreeTitle: "Free Plan",
    pricingFreePrice: "0",
    pricingPeriod: "FCFA / month",
    pricingFreeFeature1: "7 retouched photos / month",
    pricingFreeFeature2: "1 active client gallery",
    pricingFreeFeature3: "Maximum 7 photos per gallery",
    pricingFreeFeature4: "PhotoFlow AI watermark on exports",
    pricingFreeCTA: "Choose Free Plan",
    pricingProTitle: "Pro Plan",
    pricingProPrice: "12,500",
    pricingRecommended: "Recommended",
    pricingProFeature1: "Unlimited retouched photos",
    pricingProFeature2: "Unlimited client galleries",
    pricingProFeature3: "Unlimited high-res downloads",
    pricingProFeature4: "No watermark & custom branding",
    pricingProFeature5: "Advanced AI & automatic ZIP export",
    pricingProCTA: "Subscribe to Pro Now",
    faqTitle: "Frequently Asked Questions",
    footerText: "© 2026 PhotoFlow AI. Designed for African creators.",
    footerLegal: "Legal Notice",
    footerPrivacy: "Privacy Policy",
    footerSupport: "WhatsApp Customer Support",
    testimonialQuote: "\"PhotoFlow AI has literally doubled my productivity. I deliver my wedding shoots in 48 hours instead of 2 weeks. My clients absolutely love the selection interface!\"",
    testimonialAuthor: "Moussa Diop",
    testimonialRole: "Wedding Photographer, Dakar (Senegal)"
  }
};

export default function LandingPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        if (typeof window !== 'undefined') {
          const pendingPlan = localStorage.getItem('pf_signup_pending_plan');
          if (pendingPlan === 'true') {
            router.push('/checkout/select-plan');
          }
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Handle before/after slider dragging
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return; // Only move on click or drag
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  // Micro-interaction for bento grid cards shine effect
  useEffect(() => {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card: any) => {
      const handleMouseMoveCard = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(182, 196, 255, 0.05) 0%, rgba(26, 28, 28, 0.6) 70%)`;
      };
      
      const handleMouseLeaveCard = () => {
        card.style.background = 'rgba(26, 28, 28, 0.6)';
      };

      card.addEventListener('mousemove', handleMouseMoveCard);
      card.addEventListener('mouseleave', handleMouseLeaveCard);

      return () => {
        card.removeEventListener('mousemove', handleMouseMoveCard);
        card.removeEventListener('mouseleave', handleMouseLeaveCard);
      };
    });
  }, []);

  const faqs = lang === 'fr' ? [
    {
      q: "Comment fonctionne la retouche photo avec l'IA ?",
      a: "Notre IA analyse intelligemment l'exposition, le contraste et les teintes de peau spécifiques aux lumières et carnations d'Afrique. D'un simple clic, vous pouvez supprimer le bruit numérique, adoucir la peau, et ajuster la balance des blancs."
    },
    {
      q: "Quelles sont les limites de la formule gratuite ?",
      a: "Le forfait gratuit est idéal pour tester. Il inclut 7 photos retouchées par mois, 1 galerie privée pour vos clients avec un maximum de 7 photos, et un stockage d'essai. Les photos livrées comportent un filigrane discret PhotoFlow AI."
    },
    {
      q: "Quels sont les moyens de paiement acceptés pour la formule Pro ?",
      a: "Nous prenons en charge les paiements locaux les plus populaires en Afrique de l'Ouest : Wave, Orange Money, Free Money, ainsi que les cartes bancaires internationales (Visa, Mastercard)."
    },
    {
      q: "Puis-je lier mon propre nom de domaine pour les galeries clients ?",
      a: "Oui ! Avec la formule Pro, vous pouvez personnaliser l'URL de vos galeries (ex: clients.votre-studio.com) et retirer toute mention de PhotoFlow AI pour valoriser votre propre marque."
    }
  ] : [
    {
      q: "How does AI photo retouching work?",
      a: "Our AI intelligently analyzes exposure, contrast, and skin tones specific to African lighting and complexions. With a single click, you can remove digital noise, soften skin, and adjust white balance."
    },
    {
      q: "What are the limitations of the free plan?",
      a: "The free plan is ideal for testing. It includes 7 retouched photos per month, 1 private client gallery with a maximum of 7 photos, and trial storage. Delivered photos feature a discreet PhotoFlow AI watermark."
    },
    {
      q: "What payment methods are accepted for the Pro plan?",
      a: "We support the most popular local payment methods in West Africa: Wave, Orange Money, Free Money, as well as international bank cards (Visa, Mastercard)."
    },
    {
      q: "Can I link my own custom domain for client galleries?",
      a: "Yes! With the Pro plan, you can customize the URL of your galleries (e.g., clients.your-studio.com) and remove all PhotoFlow AI branding to highlight your own brand."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden">
      <Navigation />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-margin-desktop text-center hero-glow py-12">
          <div className="max-w-4xl mx-auto z-10">
            <h1 className="font-display-lg text-4xl md:text-[64px] font-bold mb-6 leading-tight tracking-tight gradient-text">
              {t.heroTitle}
            </h1>
            <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform active:scale-95 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-container/20"
              >
                {user ? (lang === 'fr' ? 'Accéder au tableau de bord' : 'Go to Dashboard') : t.heroStartFree}
              </Link>
              <a
                href="#features"
                className="border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-semibold hover:bg-surface-container-highest transition-colors text-center"
              >
                {t.heroSeeFeatures}
              </a>
            </div>
          </div>

          {/* AI Before/After Interactive Demo */}
          <div className="mt-20 w-full max-w-5xl mx-auto glass-card rounded-2xl overflow-hidden relative shadow-2xl border border-outline-variant/50">
            <div className="ai-processing-line absolute top-0 left-0 w-full z-20"></div>
            
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              className="aspect-video relative select-none cursor-ew-resize overflow-hidden"
            >
              {/* After Image (Corrected & Retouched) */}
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQgbqCA-pgs1GDYtUXOcRKiVWfmbZzJ-Mnd4k_AmW8xxx8dEBqBxIAsVHUF_tEq4JIIm_FuUi5qPziDHDcQF1kus_1Q3_WQ2kvPh3oT4vypGUwukStcakMWzsP4SoCbxQ7j0SoZo6ta1Nenm-DzbA3fuZNJ_Vu_5thipCwzVbML_ijRa6jZR0gGRioukSRNFsGtxnd_X9BjQm1GH2fekBBVS1UgLeKlZe4xfWOlVGn6emDPBt_u8a6dH_7pvqWqAZePOjS0a-jFGOy" 
                alt="Retouched Wedding Portrait" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              
              {/* Before Image Overlay (Raw Unedited, controlled by CSS clip-path) */}
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQgbqCA-pgs1GDYtUXOcRKiVWfmbZzJ-Mnd4k_AmW8xxx8dEBqBxIAsVHUF_tEq4JIIm_FuUi5qPziDHDcQF1kus_1Q3_WQ2kvPh3oT4vypGUwukStcakMWzsP4SoCbxQ7j0SoZo6ta1Nenm-DzbA3fuZNJ_Vu_5thipCwzVbML_ijRa6jZR0gGRioukSRNFsGtxnd_X9BjQm1GH2fekBBVS1UgLeKlZe4xfWOlVGn6emDPBt_u8a6dH_7pvqWqAZePOjS0a-jFGOy" 
                alt="Raw Wedding Portrait" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-75 contrast-80 saturate-[0.65] sepia-[0.12] blur-[0.5px] z-10"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              />

              {/* Slider Divider Line */}
              <div 
                style={{ left: `${sliderPosition}%` }}
                className="absolute inset-y-0 border-r-2 border-white/60 z-15 pointer-events-none"
              />

              {/* Slider Handle button overlay */}
              <div 
                style={{ left: `${sliderPosition}%` }}
                className="absolute inset-y-0 -ml-4 z-20 flex items-center pointer-events-none"
              >
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border border-primary pointer-events-auto cursor-ew-resize">
                  <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute bottom-4 left-4 z-30 font-body-sm text-body-sm text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {t.beforeLabel}
              </div>
              <div className="absolute bottom-4 right-4 z-30 font-body-sm text-body-sm text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {t.afterLabel}
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="py-24 px-6 md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-3xl md:text-4xl mb-4 font-bold">{t.featuresTitle}</h2>
              <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">{t.featuresSubtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bento Card 1: AI Retouching */}
              <div className="md:col-span-2 glass-card p-10 rounded-2xl flex flex-col justify-between group hover:border-primary/50 transition-all duration-300">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">auto_awesome</span>
                  <h3 className="font-headline-lg text-2xl font-bold mb-4">{t.bento1Title}</h3>
                  <p className="font-body-lg text-on-surface-variant max-w-md">
                    {t.bento1Desc}
                  </p>
                </div>
                <div className="mt-8 flex gap-2">
                  <div className="h-1.5 w-24 bg-primary rounded-full"></div>
                  <div className="h-1.5 w-12 bg-outline-variant rounded-full"></div>
                </div>
              </div>

              {/* Bento Card 2: Secure Delivery */}
              <div className="glass-card p-10 rounded-2xl group hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">cloud_upload</span>
                  <h3 className="font-headline-md text-xl font-bold mb-4">{t.bento2Title}</h3>
                  <p className="font-body-md text-on-surface-variant">
                    {t.bento2Desc}
                  </p>
                </div>
                <div className="mt-8 bg-background p-4 rounded-xl flex items-center gap-3 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <span className="text-[10px] font-mono tracking-widest text-on-surface-variant">{t.bento2Status}</span>
                </div>
              </div>

              {/* Bento Card 3: Smart Organization */}
              <div className="glass-card p-10 rounded-2xl group hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">folder_special</span>
                  <h3 className="font-headline-md text-xl font-bold mb-4">{t.bento3Title}</h3>
                  <p className="font-body-md text-on-surface-variant">
                    {t.bento3Desc}
                  </p>
                </div>
                <div className="mt-8 flex gap-2">
                  <span className="px-2.5 py-1 text-[10px] bg-surface-container-highest rounded border border-outline-variant/30">{t.bento3Tag1}</span>
                  <span className="px-2.5 py-1 text-[10px] bg-surface-container-highest rounded border border-outline-variant/30">{t.bento3Tag2}</span>
                </div>
              </div>

              {/* Bento Card 4: Local Payments */}
              <div className="md:col-span-2 glass-card p-10 rounded-2xl flex flex-col md:flex-row items-center gap-8 group hover:border-primary/50 transition-all duration-300">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">payments</span>
                  <h3 className="font-headline-lg text-2xl font-bold mb-4">{t.bento4Title}</h3>
                  <p className="font-body-lg text-on-surface-variant">
                    {t.bento4Desc}
                  </p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex flex-col items-center justify-center p-3 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                    <span className="text-[11px] font-bold text-primary mb-1">WAVE</span>
                    <span className="text-[9px] text-on-surface-variant">{t.bento4Tag1}</span>
                  </div>
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex flex-col items-center justify-center p-3 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                    <span className="text-[11px] font-bold text-orange-400 mb-1">ORANGE</span>
                    <span className="text-[9px] text-on-surface-variant">{t.bento4Tag2}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 md:px-margin-desktop">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold mb-4">{t.pricingTitle}</h2>
              <p className="font-body-lg text-on-surface-variant">{t.pricingSubtitle}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="flex-1 glass-panel p-10 rounded-2xl flex flex-col border border-outline-variant/40">
                <h3 className="font-headline-md text-xl font-bold mb-2">{t.pricingFreeTitle}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-price-lg text-3xl font-bold">{t.pricingFreePrice}</span>
                  <span className="font-label-md text-xs font-semibold text-on-surface-variant">{t.pricingPeriod}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {t.pricingFreeFeature1}
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {t.pricingFreeFeature2}
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {t.pricingFreeFeature3}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-outline text-lg">water_lux</span>
                    {t.pricingFreeFeature4}
                  </li>
                </ul>
                <Link
                  href={user ? "/checkout/select-plan" : "/signup"}
                  className="w-full text-center border border-outline-variant py-3 rounded-xl hover:bg-surface-container-highest transition-colors font-semibold"
                >
                  {t.pricingFreeCTA}
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="flex-1 glass-panel p-10 rounded-2xl border-2 border-primary bg-primary-container/5 flex flex-col relative scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {t.pricingRecommended}
                </div>
                <h3 className="font-headline-md text-xl font-bold mb-2">{t.pricingProTitle}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-price-lg text-3xl font-bold text-primary">{t.pricingProPrice}</span>
                  <span className="font-label-md text-xs font-semibold text-on-surface-variant">{t.pricingPeriod}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t.pricingProFeature1}
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t.pricingProFeature2}
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t.pricingProFeature3}
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t.pricingProFeature4}
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t.pricingProFeature5}
                  </li>
                </ul>
                <Link
                  href={user ? "/checkout/select-plan?plan=pro" : "/signup?plan=pro"}
                  className="w-full text-center bg-primary-container text-on-primary-container py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg"
                >
                  {t.pricingProCTA}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 px-6 md:px-margin-desktop text-center bg-surface-container-lowest">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full border-2 border-primary p-1">
                <img
                  alt="Moussa Diop Portrait"
                  className="w-full h-full object-cover rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAenCRyxln8rzfQGG04fB4wPKObvsC8CItN7ThNmg0gHN-aSHdngfdhG6uGghmirDIHpACRkKTKm-UdE7AJaCj9wmmYZXjSnph9gVQZHJPeVtammAyi-ByCQBriDj8Xjrz4UGwQdpxYW9EGLE3afV-F163J44GkUNYze7hG-S00uvtIAK8ft0FUHatu-D2ok73i_He37cnhPHedCCy4A4WVARfYt6iJ0nUiDiswleLPynSKuarsb0w3e06erJvbMJV7vGLXPnZJxmYQ"
                />
              </div>
            </div>
            <p className="font-headline-md text-xl md:text-2xl italic mb-8 text-on-surface">
              {t.testimonialQuote}
            </p>
            <div className="font-headline-md text-lg font-bold">{t.testimonialAuthor}</div>
            <div className="text-on-surface-variant font-body-sm text-xs">{t.testimonialRole}</div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 md:px-margin-desktop max-w-4xl mx-auto">
          <h2 className="font-headline-lg text-3xl font-bold text-center mb-12">{t.faqTitle}</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30 transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-6 text-left font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0)' }}>
                    keyboard_arrow_down
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-on-surface-variant text-sm border-t border-outline-variant/10 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-margin-desktop border-t border-outline-variant bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <span className="font-headline-lg text-2xl font-bold text-primary">PhotoFlow AI</span>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2">{t.footerText}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold" href="#">{t.footerLegal}</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold" href="#">{t.footerPrivacy}</a>
            <a 
              className="text-primary font-bold hover:brightness-110 transition-all text-xs flex items-center gap-1" 
              href="https://wa.me/221770000000" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t.footerSupport}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
