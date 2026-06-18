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
    heroSubtitle: "La plateforme pensée pour les photographes. Gagnez du temps sur l'editing et offrez une expérience premium à vos clients.",
    heroStartFree: "Commencer gratuitement",
    heroSeeFeatures: "Voir les fonctionnalités",
    beforeLabel: "Avant (Raw)",
    afterLabel: "Après (Retouche IA)",
    featuresTitle: "Pensé pour le workflow des photographes",
    featuresSubtitle: "Une suite d'outils professionnels pour accélérer votre productivité de la capture à la livraison.",
    bento1Title: "Retouche IA Intelligente",
    bento1Desc: "Équilibrage automatique des tons de peau et correction d'exposition optimisée pour toutes les carnations et lumières naturelles. Rendu professionnel instantané.",
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
    pricingProTitle: "Formule Pro Mensuelle",
    pricingProPrice: "6 900",
    pricingRecommended: "Populaire",
    pricingProYearlyTitle: "Formule Pro Annuelle",
    pricingProYearlyPrice: "58 800",
    pricingProYearlyPeriod: "FCFA / an",
    pricingProYearlySave: "Économisez 24 000 FCFA !",
    pricingRecommendedYearly: "Recommandé (-29%)",
    pricingProFeature1: "Photos retouchées illimitées",
    pricingProFeature2: "Galeries clients illimitées",
    pricingProFeature3: "Téléchargements illimités en HD",
    pricingProFeature4: "Sans filigrane & Branding personnalisé",
    pricingProFeature5: "IA avancée & Export ZIP automatique",
    pricingProCTA: "S'abonner maintenant Pro",
    faqTitle: "Questions Fréquentes",
    footerText: "© 2026 PhotoFlow AI. Conçu pour les créateurs du monde entier.",
    footerLegal: "Mentions Légales",
    footerPrivacy: "Confidentialité",
    footerSupport: "Support client WhatsApp",
    testimonialQuote: "\"PhotoFlow AI a littéralement doublé ma productivité. Je livre mes mariages en 48h au lieu de 2 semaines. Mes clients adorent l'interface de sélection !\"",
    testimonialAuthor: "Moussa Diop",
    testimonialRole: "Photographe de Mariage, Dakar (Sénégal)"
  },
  en: {
    heroTitle: "Retouch, organize, and deliver your photos in minutes.",
    heroSubtitle: "The platform built for photographers. Save time on editing and deliver a premium experience to your clients.",
    heroStartFree: "Start for Free",
    heroSeeFeatures: "See Features",
    beforeLabel: "Before (Raw)",
    afterLabel: "After (AI Retouch)",
    featuresTitle: "Designed for photographer workflows",
    featuresSubtitle: "A suite of professional tools to speed up your productivity from capture to delivery.",
    bento1Title: "Intelligent AI Retouching",
    bento1Desc: "Automatic skin tone balancing and exposure correction optimized for all skin tones and natural lighting. Instant professional rendering.",
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
    pricingProTitle: "Pro Monthly Plan",
    pricingProPrice: "6,900",
    pricingRecommended: "Popular",
    pricingProYearlyTitle: "Pro Yearly Plan",
    pricingProYearlyPrice: "58,800",
    pricingProYearlyPeriod: "FCFA / year",
    pricingProYearlySave: "Save 24,000 FCFA !",
    pricingRecommendedYearly: "Best Value (-29%)",
    pricingProFeature1: "Unlimited retouched photos",
    pricingProFeature2: "Unlimited client galleries",
    pricingProFeature3: "Unlimited high-res downloads",
    pricingProFeature4: "No watermark & custom branding",
    pricingProFeature5: "Advanced AI & automatic ZIP export",
    pricingProCTA: "Subscribe to Pro Now",
    faqTitle: "Frequently Asked Questions",
    footerText: "© 2026 PhotoFlow AI. Designed for creators worldwide.",
    footerLegal: "Legal Notice",
    footerPrivacy: "Privacy Policy",
    footerSupport: "WhatsApp Customer Support",
    testimonialQuote: "\"PhotoFlow AI has literally doubled my productivity. I deliver my wedding shoots in 48 hours instead of 2 weeks. My clients absolutely love the selection interface!\"",
    testimonialAuthor: "Moussa Diop",
    testimonialRole: "Wedding Photographer, Dakar (Senegal)"
  }
};

const sliderPhotos = [
  {
    categoryFr: "Mariage",
    categoryEn: "Wedding",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=80"
  },
  {
    categoryFr: "Portrait d'art",
    categoryEn: "Artistic Portrait",
    url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1000&auto=format&fit=crop&q=80"
  },
  {
    categoryFr: "Anniversaire / Fête",
    categoryEn: "Birthday & Party",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&auto=format&fit=crop&q=80"
  },
  {
    categoryFr: "Photo de Famille",
    categoryEn: "Family Shoot",
    url: "https://images.unsplash.com/photo-1772723246543-213f2a4fc526?w=1000&auto=format&fit=crop&q=80"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const t = translations[lang];

  // Preload all slider images
  useEffect(() => {
    sliderPhotos.forEach((photo) => {
      const img = new Image();
      img.src = photo.url;
    });
  }, []);

  // Auto-play interval for before/after slider (pauses during manual drag interactions)
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sliderPhotos.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isDragging]);

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
      a: "Notre IA analyse intelligemment l'exposition, le contraste et les teintes de peau spécifiques à toutes les lumières et carnations. D'un simple clic, vous pouvez supprimer le bruit numérique, adoucir la peau, et ajuster la balance des blancs."
    },
    {
      q: "Quelles sont les limites de la formule gratuite ?",
      a: "Le forfait gratuit est idéal pour tester. Il inclut 7 photos retouchées par mois, 1 galerie privée pour vos clients avec un maximum de 7 photos, et un stockage d'essai. Les photos livrées comportent un filigrane discret PhotoFlow AI."
    },
    {
      q: "Quels sont les moyens de paiement acceptés pour la formule Pro ?",
      a: "Nous prenons en charge les cartes bancaires internationales (Visa, Mastercard) pour les créateurs du monde entier, ainsi que les paiements mobiles locaux les plus populaires (Wave, Orange Money, Free Money)."
    },
    {
      q: "Puis-je lier mon propre nom de domaine pour les galeries clients ?",
      a: "Oui ! Avec la formule Pro, vous pouvez personnaliser l'URL de vos galeries (ex: clients.votre-studio.com) et retirer toute mention de PhotoFlow AI pour valoriser votre propre marque."
    }
  ] : [
    {
      q: "How does AI photo retouching work?",
      a: "Our AI intelligently analyzes exposure, contrast, and skin tones specific to all lighting and complexions. With a single click, you can remove digital noise, soften skin, and adjust white balance."
    },
    {
      q: "What are the limitations of the free plan?",
      a: "The free plan is ideal for testing. It includes 7 retouched photos per month, 1 private client gallery with a maximum of 7 photos, and trial storage. Delivered photos feature a discreet PhotoFlow AI watermark."
    },
    {
      q: "What payment methods are accepted for the Pro plan?",
      a: "We support international bank cards (Visa, Mastercard) for creators worldwide, as well as the most popular local mobile payment methods (Wave, Orange Money, Free Money)."
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
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 md:px-margin-desktop text-center py-16 overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none -z-10 mix-blend-screen"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-model-34446-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background -z-10"></div>

          {/* Floating Retouched Photo Cards (Desktop only) */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
            {/* Top Left Card */}
            <div className="absolute left-[3%] top-[12%] w-44 bg-surface-container/60 p-2.5 rounded-2xl border border-outline-variant/60 backdrop-blur-md shadow-2xl animate-float-1">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                <img
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80"
                  alt="Portrait Retouché 1"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-[#10b981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full select-none">IA ACTIVE</span>
              </div>
              <p className="text-[10px] font-bold text-white text-center">85mm f/1.4 Portrait</p>
            </div>

            {/* Bottom Left Card */}
            <div className="absolute left-[6%] bottom-[15%] w-40 bg-surface-container/60 p-2.5 rounded-2xl border border-outline-variant/60 backdrop-blur-md shadow-2xl animate-float-2">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                  alt="Portrait Retouché 2"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-[#10b981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full select-none">IA ACTIVE</span>
              </div>
              <p className="text-[10px] font-bold text-white text-center">Studio / Contrastes</p>
            </div>

            {/* Top Right Card */}
            <div className="absolute right-[3%] top-[15%] w-40 bg-surface-container/60 p-2.5 rounded-2xl border border-outline-variant/60 backdrop-blur-md shadow-2xl animate-float-3">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                <img
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80"
                  alt="Portrait Retouché 3"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-[#10b981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full select-none">IA ACTIVE</span>
              </div>
              <p className="text-[10px] font-bold text-white text-center">Lumière Naturelle</p>
            </div>

            {/* Bottom Right Card */}
            <div className="absolute right-[6%] bottom-[20%] w-44 bg-surface-container/60 p-2.5 rounded-2xl border border-outline-variant/60 backdrop-blur-md shadow-2xl animate-float-4">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                <img
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop&q=80"
                  alt="Portrait Retouché 4"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-[#10b981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full select-none">IA ACTIVE</span>
              </div>
              <p className="text-[10px] font-bold text-white text-center">Mariage Extérieur</p>
            </div>
          </div>

          {/* Decorative Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-[6s]"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8s] delay-1000"></div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-container/5 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-outline-variant/60 text-xs font-semibold text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
              <span>⚡ {lang === 'fr' ? "L'éditeur d'images IA conçu pour les photographes" : "The AI image editor built for photographers"}</span>
            </div>

            <h1 className="font-display-lg text-4xl md:text-[68px] font-extrabold mb-6 leading-[1.12] tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              {t.heroTitle}
            </h1>
            <p className="font-body-lg text-lg md:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="bg-primary text-on-secondary px-8 py-4 rounded-xl font-bold hover:scale-[1.03] transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer"
              >
                {user ? (lang === 'fr' ? 'Accéder au tableau de bord' : 'Go to Dashboard') : t.heroStartFree}
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </Link>
              <a
                href="#features"
                className="border border-outline-variant/80 text-on-surface px-8 py-4 rounded-xl font-semibold hover:bg-surface-container-high transition-all text-center cursor-pointer"
              >
                {t.heroSeeFeatures}
              </a>
            </div>
          </div>

          {/* AI Before/After Interactive Demo Mockup */}
          <div className="mt-20 w-full max-w-5xl mx-auto glass-card rounded-2xl overflow-hidden relative shadow-2xl border border-outline-variant/60 flex flex-col bg-surface-container-lowest/80 backdrop-blur-xl">
            {/* Window Header */}
            <div className="h-12 border-b border-outline-variant/40 px-4 flex justify-between items-center bg-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]/80"></span>
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80"></span>
                <span className="w-3 h-3 rounded-full bg-[#10b981]/80"></span>
                <span className="text-[11px] text-on-surface-variant font-mono ml-4 font-semibold select-none">PhotoFlow_IA_Editor_v2.0.exe</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider select-none">
                  {lang === 'fr' ? 'Algorithme IA V2' : 'AI Engine V2'}
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[500px]">
              {/* Left sidebar: Mock adjustments */}
              <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-outline-variant/30 p-5 flex flex-col gap-6 bg-surface-container-low/40 justify-center">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 select-none">{lang === 'fr' ? 'Réglages IA' : 'AI Settings'}</h4>
                  <div className="space-y-4">
                    {/* Mock Sliders */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant select-none">
                        <span>{lang === 'fr' ? 'Ton de peau' : 'Skin Tone'}</span>
                        <span className="text-primary font-mono">+85%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant select-none">
                        <span>{lang === 'fr' ? 'Exposition' : 'Exposure'}</span>
                        <span className="text-primary font-mono">+12%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[62%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant select-none">
                        <span>{lang === 'fr' ? 'Balance des blancs' : 'White Balance'}</span>
                        <span className="text-primary font-mono">Auto</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[75%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant select-none">
                        <span>{lang === 'fr' ? 'Douceur de peau' : 'Skin Softening'}</span>
                        <span className="text-primary font-mono">92%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[92%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/30 space-y-3 select-none">
                  <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-[#10b981]">check_circle</span>
                    <span>{lang === 'fr' ? 'Correction visage active' : 'Face correction active'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-[#10b981]">check_circle</span>
                    <span>{lang === 'fr' ? 'Optimisation WebP active' : 'WebP optimization active'}</span>
                  </div>
                </div>
              </div>

              {/* Slider Area */}
              <div className="flex-1 relative min-h-[350px] lg:min-h-auto overflow-hidden">
                <div 
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  className="absolute inset-0 select-none cursor-ew-resize overflow-hidden"
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 font-body-sm text-[10px] font-bold text-white bg-primary/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-primary/30 uppercase tracking-widest shadow-lg select-none">
                    {lang === 'fr' ? sliderPhotos[currentSlideIndex].categoryFr : sliderPhotos[currentSlideIndex].categoryEn}
                  </div>

                  {/* After Image (Corrected & Retouched) */}
                  <img 
                    src={sliderPhotos[currentSlideIndex].url} 
                    alt={`Retouched ${sliderPhotos[currentSlideIndex].categoryEn}`} 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-none"
                  />
                  
                  {/* Before Image Overlay */}
                  <img 
                    src={sliderPhotos[currentSlideIndex].url} 
                    alt={`Raw ${sliderPhotos[currentSlideIndex].categoryEn}`} 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-75 contrast-80 saturate-[0.65] sepia-[0.12] blur-[0.5px] z-10 transition-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  />

                  {/* Hidden preloaded images rendered to DOM for instant cache switching */}
                  {sliderPhotos.map((photo, index) => (
                    <div key={index} className="hidden">
                      <img src={photo.url} alt="" />
                    </div>
                  ))}

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
                  <div className="absolute bottom-4 left-4 z-30 font-body-sm text-[10px] font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                    {t.beforeLabel}
                  </div>
                  <div className="absolute bottom-4 right-4 z-30 font-body-sm text-[10px] font-bold text-primary bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-primary/20 uppercase tracking-widest">
                    {t.afterLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="py-28 px-6 md:px-margin-desktop bg-surface-container-lowest relative">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-background to-transparent -z-10"></div>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-headline-lg text-4xl md:text-5xl mb-4 font-extrabold tracking-tight text-white">{t.featuresTitle}</h2>
              <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto text-base">{t.featuresSubtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Bento Card 1: AI Retouching */}
              <div className="md:col-span-2 glass-card p-10 md:p-12 rounded-3xl flex flex-col justify-between group border border-outline-variant/40 hover:border-primary/40 transition-all duration-500 min-h-[340px]">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                  </div>
                  <h3 className="font-headline-lg text-2xl md:text-3xl font-bold mb-4 text-white">{t.bento1Title}</h3>
                  <p className="font-body-lg text-on-surface-variant max-w-xl leading-relaxed text-sm md:text-base">
                    {t.bento1Desc}
                  </p>
                </div>
                <div className="mt-8 relative w-full h-56 rounded-2xl overflow-hidden border border-outline-variant/30 bg-[#121214] flex flex-col shadow-2xl">
                  {/* macOS Title Bar Mockup */}
                  <div className="h-8 border-b border-outline-variant/20 px-4 flex justify-between items-center bg-[#18181b] shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444]/80"></span>
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]/80"></span>
                      <span className="w-2 h-2 rounded-full bg-[#10b981]/80"></span>
                      <span className="text-[9px] text-on-surface-variant font-mono ml-2 font-medium">editor_raw_preview.webp</span>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 border border-primary/25 text-primary text-[8px] font-extrabold px-2 py-0.5 rounded-full">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                      <span>AI ENGINE v2.5</span>
                    </div>
                  </div>

                  <div className="flex-1 relative overflow-hidden">
                    {/* After Image (Full Color Retouched) */}
                    <img 
                      src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&auto=format&fit=crop&q=80" 
                      alt="Retouch Demo" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80" 
                    />
                    {/* Before Image (Flat Raw, clipped via animation) */}
                    <img 
                      src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&auto=format&fit=crop&q=80" 
                      alt="Raw Demo" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 brightness-75 contrast-80 saturate-[0.65] sepia-[0.12] z-10 animate-[clip-auto-move_6s_ease-in-out_infinite]" 
                    />
                    {/* Sliding split line */}
                    <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_10px_#ffffff] z-20 animate-[slider-auto-move_6s_ease-in-out_infinite]"></div>
                    {/* Sliding handle button */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border border-primary z-30 animate-[slider-auto-move_6s_ease-in-out_infinite]">
                      <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
                    </div>
                    {/* Before/after split badges */}
                    <div className="absolute bottom-3 left-3 z-30 font-body-sm text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded uppercase tracking-wider select-none">
                      {t.beforeLabel}
                    </div>
                    <div className="absolute bottom-3 right-3 z-30 font-body-sm text-[9px] font-bold text-primary bg-black/60 px-2 py-0.5 rounded uppercase tracking-wider select-none">
                      {t.afterLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Secure Delivery */}
              <div className="glass-card p-10 rounded-3xl border border-outline-variant/40 hover:border-primary/40 transition-all duration-500 flex flex-col justify-between min-h-[340px] group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  </div>
                  <h3 className="font-headline-md text-xl md:text-2xl font-bold mb-4 text-white">{t.bento2Title}</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
                    {t.bento2Desc}
                  </p>
                </div>
                <div className="mt-8 relative w-full h-48 rounded-2xl overflow-hidden border border-outline-variant/30 bg-[#121214] flex items-center justify-center shadow-inner">
                  {/* Orbits grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  {/* Cyber glow sphere */}
                  <div className="absolute w-28 h-28 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>

                  {/* Concentric pulsing rings */}
                  <div className="absolute w-24 h-24 rounded-full border border-primary/20 animate-[pulse-ring_4s_infinite_linear]"></div>
                  <div className="absolute w-36 h-36 rounded-full border border-indigo-500/10 animate-[pulse-ring_6s_infinite_linear] delay-1000"></div>
                  
                  {/* Radar Dotted Spinning Circles */}
                  <div className="absolute w-28 h-28 rounded-full border border-dashed border-primary/30 animate-[security-spin_15s_linear_infinite]"></div>
                  <div className="absolute w-32 h-32 rounded-full border border-dashed border-indigo-500/20 animate-[security-spin_20s_linear_infinite_reverse]"></div>

                  {/* Cyber metadata tags */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-white/5 text-[7px] font-mono text-outline animate-pulse">
                    <span className="h-1 w-1 rounded-full bg-primary animate-ping"></span> SECURE_HOST
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-white/5 text-[7px] font-mono text-outline animate-pulse delay-500">
                    <span className="h-1 w-1 rounded-full bg-[#10b981]"></span> SHA_256
                  </div>

                  <div className="flex flex-col items-center z-10 transition-transform duration-500 group-hover:scale-105">
                    <span className="material-symbols-outlined text-primary text-5xl mb-2 filter drop-shadow-[0_0_12px_rgba(165,180,252,0.5)]">
                      shield_lock
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-primary font-extrabold bg-primary-container/20 border border-primary/30 px-3 py-1 rounded-full uppercase">
                      {t.bento2Status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Smart Organization */}
              <div className="glass-card p-10 rounded-3xl border border-outline-variant/40 hover:border-primary/40 transition-all duration-500 flex flex-col justify-between min-h-[340px] group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">folder_special</span>
                  </div>
                  <h3 className="font-headline-md text-xl md:text-2xl font-bold mb-4 text-white">{t.bento3Title}</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
                    {t.bento3Desc}
                  </p>
                </div>
                <div className="mt-8 relative w-full h-48 rounded-2xl overflow-hidden border border-outline-variant/30 bg-[#121214] flex flex-col justify-center p-4">
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  <div className="flex items-center justify-around z-10 w-full relative">
                    {/* Face Detections Column */}
                    <div className="flex flex-col gap-4">
                      {/* Floating Avatar 1 with Face Recognition Corner brackets */}
                      <div className="relative group/avatar animate-[float-tag_3s_ease-in-out_infinite]">
                        <div className="w-12 h-12 rounded-xl border border-white/20 overflow-hidden shadow-lg">
                          <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover" />
                        </div>
                        {/* Face recognition frame overlay */}
                        <div className="absolute -inset-1 border border-primary/60 rounded-xl animate-pulse">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary"></div>
                        </div>
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[6px] font-mono text-primary bg-black/85 px-1 rounded border border-primary/20 select-none whitespace-nowrap">ID: MOUSSA</span>
                      </div>

                      {/* Floating Avatar 2 with Face Recognition Corner brackets */}
                      <div className="relative group/avatar animate-[float-tag_3s_ease-in-out_infinite] delay-1000">
                        <div className="w-12 h-12 rounded-xl border border-white/20 overflow-hidden shadow-lg">
                          <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover" />
                        </div>
                        {/* Face recognition frame overlay */}
                        <div className="absolute -inset-1 border border-indigo-400/60 rounded-xl animate-pulse">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo-400"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-indigo-400"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-indigo-400"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-400"></div>
                        </div>
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[6px] font-mono text-indigo-300 bg-black/85 px-1 rounded border border-indigo-500/20 select-none whitespace-nowrap">ID: DIOP</span>
                      </div>
                    </div>

                    {/* Flow arrow indicators */}
                    <div className="flex flex-col gap-10 items-center justify-center select-none">
                      <span className="material-symbols-outlined text-primary/50 animate-pulse text-base">
                        double_arrow
                      </span>
                      <span className="material-symbols-outlined text-indigo-400/50 animate-pulse text-base delay-500">
                        double_arrow
                      </span>
                    </div>
                    
                    {/* Organized Target Folders */}
                    <div className="flex flex-col gap-3">
                      <div className="w-28 bg-[#1e1e21] border border-outline-variant/30 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 group-hover:border-primary/45 transition-colors">
                        <span className="material-symbols-outlined text-primary text-base">folder</span>
                        <div className="text-left leading-none">
                          <p className="text-[9px] font-bold text-white uppercase tracking-wider">Mariages</p>
                          <span className="text-[7px] text-outline-variant font-mono mt-0.5 block">148 photos</span>
                        </div>
                      </div>
                      <div className="w-28 bg-[#1e1e21] border border-outline-variant/30 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 group-hover:border-primary/45 transition-colors">
                        <span className="material-symbols-outlined text-indigo-400 text-base">folder</span>
                        <div className="text-left leading-none">
                          <p className="text-[9px] font-bold text-white uppercase tracking-wider">Portraits</p>
                          <span className="text-[7px] text-outline-variant font-mono mt-0.5 block">92 photos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Small floating tag text */}
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 text-[8px] font-bold text-white bg-black/60 rounded border border-white/10 uppercase tracking-wider">{t.bento3Tag1}</span>
                    <span className="px-2 py-0.5 text-[8px] font-bold text-white bg-black/60 rounded border border-white/10 uppercase tracking-wider">{t.bento3Tag2}</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 4: Local Payments */}
              <div className="md:col-span-2 glass-card p-10 md:p-12 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-8 border border-outline-variant/40 hover:border-primary/40 transition-all duration-500 min-h-[340px] group/card4">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                  </div>
                  <h3 className="font-headline-lg text-2xl md:text-3xl font-bold mb-4 text-white">{t.bento4Title}</h3>
                  <p className="font-body-lg text-on-surface-variant leading-relaxed text-sm md:text-base">
                    {t.bento4Desc}
                  </p>
                </div>
                <div className="relative w-64 h-40 shrink-0 mx-auto mt-4 md:mt-0 flex items-center justify-center select-none">
                  {/* Wave Card */}
                  <div className="absolute w-36 h-24 bg-gradient-to-tr from-[#0a1e3f] via-[#1e40af] to-[#3b82f6] rounded-xl flex flex-col items-start justify-between p-3 border border-blue-500/30 shadow-2xl transition-all duration-500 origin-bottom-right rotate-[-12deg] z-10 translate-x-[-12px] group-hover/card4:rotate-[-24deg] group-hover/card4:translate-x-[-48px] group-hover/card4:translate-y-[-16px] group-hover/card4:shadow-blue-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <div className="flex justify-between w-full items-center">
                      <span className="text-[8px] font-bold text-blue-200 uppercase tracking-widest">WAVE</span>
                      <span className="material-symbols-outlined text-blue-300 text-xs">wifi</span>
                    </div>
                    <div className="w-5 h-4 bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-300 rounded-sm opacity-80 my-1"></div>
                    <div className="w-full">
                      <span className="text-[6px] text-blue-200/60 font-mono block">CARD NUMBER</span>
                      <span className="text-[7px] font-mono text-white tracking-wider font-semibold">•••• •••• •••• 4022</span>
                    </div>
                  </div>
                  
                  {/* Orange Money Card */}
                  <div className="absolute w-36 h-24 bg-gradient-to-tr from-[#2d1208] via-[#c2410c] to-[#f97316] rounded-xl flex flex-col items-start justify-between p-3 border border-orange-500/30 shadow-2xl transition-all duration-500 origin-bottom z-20 group-hover/card4:translate-y-[-24px] group-hover/card4:scale-105 group-hover/card4:shadow-orange-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite] delay-300"></div>
                    <div className="flex justify-between w-full items-center">
                      <span className="text-[8px] font-bold text-orange-200 uppercase tracking-widest">ORANGE</span>
                      <span className="material-symbols-outlined text-orange-300 text-xs">contactless</span>
                    </div>
                    <div className="w-5 h-4 bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-300 rounded-sm opacity-80 my-1"></div>
                    <div className="w-full">
                      <span className="text-[6px] text-orange-200/60 font-mono block">CARD NUMBER</span>
                      <span className="text-[7px] font-mono text-white tracking-wider font-semibold">•••• •••• •••• 7731</span>
                    </div>
                  </div>

                  {/* Free Money Card */}
                  <div className="absolute w-36 h-24 bg-gradient-to-tr from-[#30080d] via-[#b91c1c] to-[#ef4444] rounded-xl flex flex-col items-start justify-between p-3 border border-red-500/30 shadow-2xl transition-all duration-500 origin-bottom-left rotate-[12deg] z-30 translate-x-[12px] group-hover/card4:rotate-[24deg] group-hover/card4:translate-x-[48px] group-hover/card4:translate-y-[-16px] group-hover/card4:shadow-red-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite] delay-700"></div>
                    <div className="flex justify-between w-full items-center">
                      <span className="text-[8px] font-bold text-red-200 uppercase tracking-widest">FREE</span>
                      <span className="material-symbols-outlined text-red-300 text-xs">credit_card</span>
                    </div>
                    <div className="w-5 h-4 bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-300 rounded-sm opacity-80 my-1"></div>
                    <div className="w-full">
                      <span className="text-[6px] text-red-200/60 font-mono block">CARD NUMBER</span>
                      <span className="text-[7px] font-mono text-white tracking-wider font-semibold">•••• •••• •••• 9924</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-28 px-6 md:px-margin-desktop relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-headline-lg text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">{t.pricingTitle}</h2>
              <p className="font-body-lg text-on-surface-variant text-base">{t.pricingSubtitle}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="flex-1 glass-panel p-8 rounded-3xl flex flex-col border border-outline-variant/40 bg-surface-container-low/40 backdrop-blur-xl">
                <h3 className="font-headline-md text-xl font-bold mb-2 text-white">{t.pricingFreeTitle}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-price-lg text-4xl font-extrabold text-white">{t.pricingFreePrice}</span>
                  <span className="font-label-md text-xs font-semibold text-on-surface-variant">{t.pricingPeriod}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow text-on-surface-variant">
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span>{t.pricingFreeFeature1}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span>{t.pricingFreeFeature2}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span>{t.pricingFreeFeature3}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-outline text-lg">water_lux</span>
                    <span>{t.pricingFreeFeature4}</span>
                  </li>
                </ul>
                <Link
                  href={user ? "/checkout/select-plan" : "/signup"}
                  className="w-full text-center border border-outline-variant/80 py-3 rounded-xl hover:bg-surface-container-high hover:text-white transition-all font-semibold text-sm cursor-pointer"
                >
                  {t.pricingFreeCTA}
                </Link>
              </div>

              {/* Pro Monthly Plan */}
              <div className="flex-1 glass-panel p-8 rounded-3xl border border-outline-variant/40 bg-surface-container-low/40 backdrop-blur-xl flex flex-col relative shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-outline-variant/50 text-on-surface px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {t.pricingRecommended}
                </div>
                <h3 className="font-headline-md text-xl font-bold mb-2 text-white">{t.pricingProTitle}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-price-lg text-4xl font-extrabold text-white">{t.pricingProPrice}</span>
                  <span className="font-label-md text-xs font-semibold text-on-surface-variant">{t.pricingPeriod}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow text-zinc-300">
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature1}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature2}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature3}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature4}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature5}</span>
                  </li>
                </ul>
                <Link
                  href={user ? "/checkout/select-plan?plan=pro" : "/signup?plan=pro"}
                  className="w-full text-center border border-outline-variant/80 py-3 rounded-xl hover:bg-surface-container-high hover:text-white transition-all font-semibold text-sm cursor-pointer"
                >
                  {t.pricingProCTA}
                </Link>
              </div>

              {/* Pro Yearly Plan */}
              <div className="flex-1 glass-panel p-8 rounded-3xl border-2 border-primary/80 bg-gradient-to-b from-primary/10 to-indigo-500/5 flex flex-col relative scale-[1.02] shadow-2xl backdrop-blur-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-secondary px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">
                  {t.pricingRecommendedYearly}
                </div>
                <h3 className="font-headline-md text-xl font-bold mb-2 text-white">{t.pricingProYearlyTitle}</h3>
                <div className="flex flex-col gap-1 mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-price-lg text-4xl font-extrabold text-primary">{t.pricingProYearlyPrice}</span>
                    <span className="font-label-md text-xs font-semibold text-on-surface-variant">{t.pricingProYearlyPeriod}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] font-bold">savings</span>
                    {t.pricingProYearlySave}
                  </span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow text-zinc-200">
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature1}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature2}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature3}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature4}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{t.pricingProFeature5}</span>
                  </li>
                </ul>
                <Link
                  href={user ? "/checkout/select-plan?plan=pro" : "/signup?plan=pro"}
                  className="w-full text-center bg-primary text-on-secondary py-3.5 rounded-xl font-extrabold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 cursor-pointer text-sm"
                >
                  {t.pricingProCTA}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-28 px-6 md:px-margin-desktop text-center bg-surface-container-lowest/40 border-y border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Stars rating */}
            <div className="flex gap-1 mb-8 text-[#f59e0b] animate-pulse">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            
            <p className="font-headline-md text-xl md:text-3xl italic mb-10 text-white leading-relaxed font-semibold">
              {t.testimonialQuote}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-full border-2 border-primary/60 p-0.5">
                <img
                  alt="Moussa Diop Portrait"
                  className="w-full h-full object-cover rounded-full"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
                />
              </div>
              <div className="text-left">
                <div className="font-headline-md text-lg font-bold text-white">{t.testimonialAuthor}</div>
                <div className="text-on-surface-variant font-body-sm text-xs mt-0.5">{t.testimonialRole}</div>
              </div>
            </div>
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
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes float-tag {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slider-auto-move {
          0% { left: 15%; }
          50% { left: 85%; }
          100% { left: 15%; }
        }
        @keyframes clip-auto-move {
          0% { clip-path: inset(0 85% 0 0); }
          50% { clip-path: inset(0 15% 0 0); }
          100% { clip-path: inset(0 85% 0 0); }
        }
        @keyframes security-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
