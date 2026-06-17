'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useLanguage } from '@/hooks/useLanguage';

const PLACEHOLDERS_BY_TYPE: Record<string, string> = {
  Mariage: "Ex: Mariage de Bineta & Fallou",
  Portrait: "Ex: Portrait de Amina",
  Mode: "Ex: Shooting Mode Almadies",
  Sportif: "Ex: Match de Football Ngor",
  Paysage: "Ex: Paysage Coucher de Soleil Lac Rose",
  Anniversaire: "Ex: Anniversaire de Moussa",
  Baptême: "Ex: Baptême de Awa",
  Corporate: "Ex: Événement Corporate Orange",
  Immobilier: "Ex: Shooting Villa Almadies",
};

const translations = {
  fr: {
    hello: 'Bonjour',
    photographer: 'Photographe',
    activityOverview: "Voici un aperçu de votre activité créative aujourd'hui.",
    projects: 'Projets',
    photos: 'Photos',
    storage: 'Stockage',
    income: 'Revenus',
    shootsCreated: 'shoots créés',
    syncedCloud: 'Synchronisé avec le Cloud',
    incomeValidated: 'Revenus validés',
    recentProjects: 'Projets Récents',
    viewAll: 'Voir tout',
    noProjectCreated: 'Aucun projet créé pour le moment.',
    createFirstProject: 'Créer mon premier shoot',
    clientLabel: 'Client',
    notAssigned: 'Non attribué',
    aiActiveTasks: 'Tâches IA Actives',
    hdrEnhancement: 'Amélioration HDR',
    noiseReduction: 'Suppression du bruit ISO',
    waitingState: 'En attente',
    recentClients: 'Clients Récents',
    noClientsSaved: 'Aucun client enregistré.',
    nextShootTitle: 'Prochain Shooting',
    noUpcomingShoot: 'Aucun shooting de prévu.',
    newShootModalTitle: 'Nouveau Shoot Photo',
    projectNameLabel: 'Nom du Projet',
    eventTypeLabel: "Type d'Événement",
    shootDateLabel: 'Date du Shoot',
    associatedClientLabel: 'Client Associé',
    selectClientOptional: 'Sélectionner un client (Optionnel)',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Notes sur le brief, le lieu, ou le matériel...',
    cancelButton: 'Annuler',
    createButton: 'Créer le Shoot',
    creatingState: 'Création...',
    projectCreatedSuccess: 'Projet Créé avec Succès !',
    projectSuccessDesc: 'Le shooting a été configuré et sa galerie sécurisée a été générée. Vous pouvez maintenant y importer vos clichés pour lancer les retouches IA.',
    accessShootButton: 'Accéder au shooting',
    onboardingHeader: 'Guide de démarrage',
    onboardingTitle: 'Configurez votre flux de travail automatisé',
    onboardingDesc: 'Suivez ces étapes simples pour prendre en main PhotoFlow AI, organiser vos clichés et automatiser votre facturation.',
    completedLabel: 'complété',
    steps: [
      {
        title: "Créer votre premier client",
        description: "Enregistrez les coordonnées d'un client dans votre répertoire pour l'associer à vos shootings.",
        ctaLabel: "Ajouter un client",
      },
      {
        title: "Créer un shooting photo",
        description: "Planifiez une séance photo en lui associant un client et en choisissant une catégorie comme Sportif ou Paysage.",
        ctaLabel: "Planifier un shoot",
      },
      {
        title: "Importer et éditer des photos",
        description: "Accédez à votre shooting pour importer vos clichés bruts et tester les outils d'amélioration IA de PhotoFlow.",
        ctaLabel: "Accéder aux projets",
      },
      {
        title: "Configurer et sécuriser la galerie",
        description: "Configurez un mot de passe ou désactivez/modifiez le filigrane de protection sur la galerie d'un shooting.",
        ctaLabel: "Configurer la galerie",
      },
      {
        title: "Émettre votre première facture ou devis",
        description: "Générez un document pro (facture ou devis) avec paiement Wave ou Mobile Money activable en un clic.",
        ctaLabel: "Créer une facture",
      }
    ]
  },
  en: {
    hello: 'Hello',
    photographer: 'Photographer',
    activityOverview: "Here is an overview of your creative activity today.",
    projects: 'Projects',
    photos: 'Photos',
    storage: 'Storage',
    income: 'Invoices',
    shootsCreated: 'shoots created',
    syncedCloud: 'Synced with the Cloud',
    incomeValidated: 'Verified earnings',
    recentProjects: 'Recent Projects',
    viewAll: 'View all',
    noProjectCreated: 'No projects created yet.',
    createFirstProject: 'Create my first shoot',
    clientLabel: 'Client',
    notAssigned: 'Not assigned',
    aiActiveTasks: 'Active AI Tasks',
    hdrEnhancement: 'HDR Enhancement',
    noiseReduction: 'ISO Noise Reduction',
    waitingState: 'Waiting',
    recentClients: 'Recent Clients',
    noClientsSaved: 'No clients registered.',
    nextShootTitle: 'Next Shooting',
    noUpcomingShoot: 'No upcoming shoots scheduled.',
    newShootModalTitle: 'New Photo Shoot',
    projectNameLabel: 'Project Name',
    eventTypeLabel: 'Event Type',
    shootDateLabel: 'Shoot Date',
    associatedClientLabel: 'Associated Client',
    selectClientOptional: 'Select a client (Optional)',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Notes on the brief, location, or equipment...',
    cancelButton: 'Cancel',
    createButton: 'Create Shoot',
    creatingState: 'Creating...',
    projectCreatedSuccess: 'Project Created Successfully!',
    projectSuccessDesc: 'The shoot has been configured and its secure gallery has been generated. You can now upload your shots to launch AI enhancements.',
    accessShootButton: 'Access the shoot',
    onboardingHeader: 'Onboarding Guide',
    onboardingTitle: 'Configure your automated workflow',
    onboardingDesc: 'Follow these simple steps to get started with PhotoFlow AI, organize your shots, and automate your billing.',
    completedLabel: 'completed',
    steps: [
      {
        title: "Create your first client",
        description: "Save a client's contact information in your directory to link their projects and send them invoices.",
        ctaLabel: "Add a client",
      },
      {
        title: "Create a photo shoot",
        description: "Schedule a photo session by associating it with a client and choosing a category like Sport or Landscape.",
        ctaLabel: "Schedule a shoot",
      },
      {
        title: "Import and edit photos",
        description: "Access your shoot to import your raw photos and try out PhotoFlow's AI enhancement tools.",
        ctaLabel: "Access projects",
      },
      {
        title: "Configure and secure the gallery",
        description: "Configure a password or disable/modify the protection watermark on a shoot's gallery.",
        ctaLabel: "Configure gallery",
      },
      {
        title: "Issue your first invoice or estimate",
        description: "Generate a professional document (invoice or estimate) with one-click Wave or Mobile Money payments.",
        ctaLabel: "Create an invoice",
      }
    ]
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Data States
  const [stats, setStats] = useState({ projects: 0, photos: 0, storage: 0, income: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [galleryConfigured, setGalleryConfigured] = useState(false);
  const [invoicesCount, setInvoicesCount] = useState(0);
  
  // UI States
  const [showNewShootModal, setShowNewShootModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(true);
  const [aiProgress, setAiProgress] = useState(78);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // New Shoot Form State
  const [shootName, setShootName] = useState('');
  const [shootClientId, setShootClientId] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [shootDesc, setShootDesc] = useState('');
  const [shootType, setShootType] = useState('Mariage');
  const [creatingShoot, setCreatingShoot] = useState(false);

  const t = translations[lang];

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('pf_onboarding_dismissed', 'true');
  };

  useEffect(() => {
    // Check Onboarding dismissed status
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('pf_onboarding_dismissed');
      if (dismissed !== 'true') {
        setShowOnboarding(true);
      }
    }

    // Check Auth State
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        if (typeof window !== 'undefined') {
          const pendingPlan = localStorage.getItem('pf_signup_pending_plan');
          if (pendingPlan === 'true') {
            localStorage.removeItem('pf_signup_pending_plan');
            router.push('/checkout/select-plan');
            return;
          }
        }
        setUser(session.user);
        fetchDashboardData(session.user.id);
      }
    });

    // Simulate AI progress increments
    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev < 100) {
          const next = prev + Math.random() * 2;
          return Math.min(100, next);
        }
        return 100;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  // Open the new shoot modal if '?new=true' is in the URL search query
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && profile) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('new') === 'true') {
        if (profile.plan !== 'pro' && projects.length >= 3) {
          setTimeout(() => setShowUpgradeModal(true), 0);
        } else {
          setTimeout(() => setShowNewShootModal(true), 0);
        }
        // Clear query parameters without reloading the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [loading, profile, projects]);

  async function fetchDashboardData(userId: string) {
    setLoading(true);
    try {
      // 1. Fetch Profile, Clients, Projects, Invoices in parallel
      const [
        { data: profileData },
        { data: clientsData },
        { data: projectsData },
        { data: invoicesData }
      ] = await Promise.all([
        supabase.from('pf_profiles').select('*').eq('id', userId).single(),
        supabase.from('pf_clients').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('pf_projects').select('*, pf_clients(name), pf_photos(original_url, created_at)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('pf_invoices').select('amount_fcfa, status').eq('user_id', userId)
      ]);
      
      if (profileData) {
        setProfile(profileData);
      }
      
      const userClients = clientsData || [];
      setClients(userClients);

      const userProjects = projectsData || [];
      setProjects(userProjects);

      // 2. Fetch Photos for stats & check if any gallery is configured in parallel
      let photoCount = 0;
      let isGalleryConfigured = false;

      if (userProjects.length > 0) {
        const projectIds = userProjects.map((p) => p.id);
        const [
          { count },
          { data: galleriesData }
        ] = await Promise.all([
          supabase.from('pf_photos').select('*', { count: 'exact', head: true }).in('project_id', projectIds),
          supabase.from('pf_galleries').select('is_protected, password_hash, apply_watermark').in('project_id', projectIds)
        ]);

        photoCount = count || 0;
        isGalleryConfigured = galleriesData?.some(
          (g: any) => g.is_protected || g.password_hash || g.apply_watermark === false
        ) || false;
      }

      setGalleryConfigured(isGalleryConfigured);

      const totalIncome = invoicesData?.filter((inv: any) => inv.status === 'paid').reduce((acc: number, inv: any) => acc + inv.amount_fcfa, 0) || 0;
      setInvoicesCount(invoicesData?.length || 0);

      // Update Statistics
      setStats({
        projects: userProjects.length,
        photos: photoCount,
        storage: profileData?.storage_used || 0,
        income: totalIncome,
      });

    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenNewShootModal = () => {
    if (profile?.plan !== 'pro' && projects.length >= 3) {
      setShowUpgradeModal(true);
      return;
    }
    setShowNewShootModal(true);
  };

  const handleCreateShoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (profile?.plan !== 'pro' && projects.length >= 3) {
      setShowUpgradeModal(true);
      return;
    }
    setCreatingShoot(true);

    try {
      const { data, error } = await supabase
        .from('pf_projects')
        .insert({
          user_id: user.id,
          name: shootName,
          client_id: shootClientId || null,
          date: shootDate || null,
          description: shootDesc,
          project_type: shootType,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-generate empty secure gallery link for new project
      const slug = shootName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      await supabase
        .from('pf_galleries')
        .insert({
          project_id: data.id,
          url_slug: slug,
          is_protected: false,
          apply_watermark: true,
        });

      // Reset Form and reload
      setShowNewShootModal(false);
      setShootName('');
      setShootClientId('');
      setShootDate('');
      setShootDesc('');
      setCreatedProjectId(data.id);
      setShowSuccessModal(true);
      fetchDashboardData(user.id);
    } catch (err) {
      console.error('Error creating shoot:', err);
      alert(lang === 'fr' ? 'Erreur lors de la création du shoot.' : 'Error creating shoot.');
    } finally {
      setCreatingShoot(false);
    }
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + ' GB';
  };

  const getStoragePercent = () => {
    if (!profile) return 0;
    return (profile.storage_used / profile.storage_limit) * 100;
  };

  const getNextShoot = () => {
    if (projects.length === 0) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = [...projects]
      .filter((p) => p.date && p.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextShoot = getNextShoot();
  let nextShootDay = '';
  let nextShootMonth = '';
  if (nextShoot && nextShoot.date) {
    const d = new Date(nextShoot.date);
    nextShootDay = d.getDate().toString();
    nextShootMonth = d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' });
  }

  const steps = [
    {
      id: 1,
      title: t.steps[0].title,
      description: t.steps[0].description,
      isCompleted: clients.length > 0,
      ctaLabel: t.steps[0].ctaLabel,
      ctaHref: "/dashboard/clients?new=true",
      icon: "person_add"
    },
    {
      id: 2,
      title: t.steps[1].title,
      description: t.steps[1].description,
      isCompleted: projects.length > 0,
      ctaLabel: t.steps[1].ctaLabel,
      onClick: handleOpenNewShootModal,
      icon: "add_a_photo"
    },
    {
      id: 3,
      title: t.steps[2].title,
      description: t.steps[2].description,
      isCompleted: stats.photos > 0,
      ctaLabel: t.steps[2].ctaLabel,
      ctaHref: "/dashboard/projects",
      icon: "cloud_upload"
    },
    {
      id: 4,
      title: t.steps[3].title,
      description: t.steps[3].description,
      isCompleted: galleryConfigured,
      ctaLabel: t.steps[3].ctaLabel,
      ctaHref: "/dashboard/projects",
      icon: "security"
    },
    {
      id: 5,
      title: t.steps[4].title,
      description: t.steps[4].description,
      isCompleted: invoicesCount > 0,
      ctaLabel: t.steps[4].ctaLabel,
      ctaHref: "/dashboard/invoices?new=true",
      icon: "receipt_long"
    }
  ];

  const completedSteps = steps.filter(step => step.isCompleted).length;
  const progressPercent = (completedSteps / steps.length) * 100;
  const isAllCompleted = completedSteps === steps.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container">
      <Navigation />
      
      {/* Sidebar - hides on mobile */}
      <Sidebar 
        onNewShootClick={handleOpenNewShootModal} 
        activeProjectName={projects[0]?.name || 'PhotoFlow Shoot'} 
        isAiProcessing={isAiProcessing}
      />
      
      {/* Main Canvas */}
      <main className="md:ml-[280px] pt-24 px-6 md:px-margin-desktop pb-24 bg-background min-h-screen">
        {/* Welcome Header Banner */}
        <header className="relative p-8 rounded-3xl bg-gradient-to-r from-surface-container-low/90 via-primary/5 to-surface-container-low/90 border border-outline-variant/30 overflow-hidden shadow-lg mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-secondary/5 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="font-display-lg text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-primary/80 mb-2">
                {t.hello}, {profile?.full_name?.split(' ')[0] || t.photographer} ✨
              </h1>
              <p className="text-on-surface-variant font-body-md text-sm">{t.activityOverview}</p>
            </div>
            
            <button
              onClick={handleOpenNewShootModal}
              className="px-5 py-3 bg-primary text-on-primary hover:brightness-110 active:scale-98 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">add_a_photo</span>
              {lang === 'fr' ? 'Nouveau Shooting' : 'New Shoot'}
            </button>
          </div>
        </header>

        {/* Guide de démarrage (Onboarding Wizard) */}
        {!isAllCompleted && showOnboarding && (
          <section className="glass-panel p-6 rounded-3xl mb-10 border border-primary/20 bg-gradient-to-br from-surface-container/80 via-surface-container/90 to-surface-container-low/85 relative overflow-hidden shadow-xl animate-in fade-in duration-300">
            {/* Dismiss button */}
            <button 
              onClick={handleDismissOnboarding}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Masquer le guide' : 'Dismiss guide'}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            {/* Background radial glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                  {t.onboardingHeader} • {completedSteps}/5 {lang === 'fr' ? 'étapes' : 'steps'}
                </span>
                <h2 className="font-display-lg text-2xl font-bold text-white mt-3">
                  {t.onboardingTitle}
                </h2>
                <p className="text-on-surface-variant text-xs mt-1 max-w-xl">
                  {t.onboardingDesc}
                </p>
              </div>
              
              {/* Progress meter */}
              <div className="flex flex-col items-end gap-1.5 min-w-[120px] mr-8">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="text-primary text-sm font-extrabold">{Math.round(progressPercent)}%</span> {t.completedLabel}
                </div>
                <div className="w-full md:w-32 bg-surface-container-highest h-2 rounded-full overflow-hidden border border-outline-variant/30">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500 electric-glow" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stepper items list */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => {
                const isCurrent = index === steps.findIndex(s => !s.isCompleted);
                return (
                  <div 
                    key={step.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between hover:scale-[1.02] duration-300 ${
                      step.isCompleted 
                        ? 'bg-green-950/10 border-green-800/20 opacity-70' 
                        : isCurrent 
                          ? 'bg-surface-container-highest/80 border-primary/40 shadow-lg ring-1 ring-primary/20' 
                          : 'bg-surface-container-low/30 border-outline-variant/15 opacity-90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.isCompleted 
                            ? 'bg-green-500/25 text-green-400 border border-green-500/30' 
                            : isCurrent 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {step.isCompleted ? 'check' : step.icon}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Étape {step.id}
                        </span>
                      </div>
                      
                      <h3 className={`text-xs font-bold ${step.isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <p className="text-[10px] text-on-surface-variant mt-1.5 line-clamp-3 min-h-[45px]">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      {step.isCompleted ? (
                        <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Terminé
                        </span>
                      ) : step.onClick ? (
                        <button 
                          onClick={step.onClick}
                          className="w-full text-center py-2 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow"
                        >
                          {step.ctaLabel}
                        </button>
                      ) : (
                        <Link 
                          href={step.ctaHref || '#'}
                          className="block w-full text-center py-2 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-lg hover:brightness-110 active:scale-98 transition-all shadow"
                        >
                          {step.ctaLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1: Projects */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-md text-[10px] uppercase tracking-wider font-extrabold text-on-surface-variant/80">{t.projects}</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">camera</span>
              </div>
            </div>
            <div className="font-headline-lg text-3xl font-extrabold text-white mt-1">{stats.projects}</div>
            <div className="text-[10px] text-purple-400 font-bold tracking-wide"> {t.shootsCreated}</div>
          </div>

          {/* Card 2: Photos */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-md text-[10px] uppercase tracking-wider font-extrabold text-on-surface-variant/80">{t.photos}</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">image</span>
              </div>
            </div>
            <div className="font-headline-lg text-3xl font-extrabold text-white mt-1">{stats.photos}</div>
            <div className="text-[10px] text-blue-400 font-bold tracking-wide">{t.syncedCloud}</div>
          </div>

          {/* Card 3: Storage */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-md text-[10px] uppercase tracking-wider font-extrabold text-on-surface-variant/80">{t.storage}</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">cloud_done</span>
              </div>
            </div>
            <div className="flex items-end justify-between mt-1">
              <div className="font-headline-lg text-2xl font-extrabold text-white">
                {formatStorage(stats.storage)}
              </div>
              <div className="text-xs text-on-surface-variant font-semibold">
                / {formatStorage(profile?.storage_limit || 1073741824)}
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden border border-outline-variant/20 mt-1">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getStoragePercent()}%` }}
              ></div>
            </div>
          </div>

          {/* Card 4: Revenue */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-label-md text-[10px] uppercase tracking-wider font-extrabold text-on-surface-variant/80">{t.income}</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
            </div>
            <div className="font-headline-lg text-2xl font-extrabold text-white mt-1">
              {stats.income.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} <span className="text-sm text-amber-400 font-bold">FCFA</span>
            </div>
            <div className="text-[10px] text-amber-400 font-bold tracking-wide">{t.incomeValidated}</div>
          </div>
        </section>

        {/* Dashboard Grid split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects and AI Tasks */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-md text-xl font-bold">{t.recentProjects}</h2>
              <Link href="/dashboard/projects" className="text-primary text-xs font-semibold hover:underline">
                {t.viewAll}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-2 glass-panel p-10 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/40">
                  <span className="material-symbols-outlined text-outline text-5xl mb-4">folder_open</span>
                  <p className="text-on-surface-variant text-sm mb-4">{t.noProjectCreated}</p>
                  <button 
                    onClick={handleOpenNewShootModal}
                    className="bg-primary/20 text-primary border border-primary/30 px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer shadow-lg"
                  >
                    {t.createFirstProject}
                  </button>
                </div>
              ) : (
                projects.slice(0, 2).map((proj, idx) => (
                  <div 
                    key={proj.id}
                    onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-outline-variant/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Photo count pill top left */}
                    <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[10px]">image</span>
                      {proj.pf_photos ? proj.pf_photos.length : 0} {proj.pf_photos && proj.pf_photos.length > 1 ? 'photos' : 'photo'}
                    </div>

                    {/* Category badge top right */}
                    <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[9px] font-bold bg-primary/20 text-primary backdrop-blur-md border border-primary/30 uppercase tracking-widest font-mono">
                      {proj.project_type || 'Shoot'}
                    </div>

                    <img
                      alt={proj.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={
                        (proj.pf_photos && proj.pf_photos.length > 0)
                          ? [...proj.pf_photos].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].original_url
                          : (idx === 0 
                              ? "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80"
                              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80")
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <h3 className="font-headline-md text-lg text-white font-extrabold">{proj.name}</h3>
                      <p className="text-xs text-on-surface-variant/80 mt-1 truncate">
                        {t.clientLabel} : <span className="text-white/95 font-semibold">{proj.pf_clients?.name || t.notAssigned}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Active Tasks */}
            {projects.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <h2 className="font-headline-md text-base font-bold text-white">{t.aiActiveTasks}</h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    <span>ACTIVE</span>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-on-surface-variant">{t.hdrEnhancement} - <span className="text-white">{projects[0]?.name}</span></span>
                      <span className="text-primary">{Math.floor(aiProgress)}%</span>
                    </div>
                    <div className="relative h-2 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10">
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary electric-glow rounded-full transition-all duration-300"
                        style={{ width: `${aiProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2 opacity-50">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-on-surface-variant">{t.noiseReduction}</span>
                      <span className="text-on-surface-variant/80 font-medium">{t.waitingState}</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full border border-outline-variant/10"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Clients Directory & Calendar */}
          <div className="space-y-10">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-md text-base font-extrabold text-white">{t.recentClients}</h2>
                <Link 
                  href="/dashboard/clients"
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary/15 border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary flex items-center justify-center transition-all cursor-pointer"
                  title={lang === 'fr' ? 'Ajouter un client' : 'Add a client'}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {clients.length === 0 ? (
                  <div className="glass-panel p-6 rounded-2xl text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/50">
                    {t.noClientsSaved}
                  </div>
                ) : (
                  clients.slice(0, 3).map((cl) => (
                    <div 
                      key={cl.id}
                      onClick={() => router.push(`/dashboard/clients`)}
                      className="glass-panel p-3.5 rounded-2xl flex items-center gap-3.5 hover:bg-surface-container-high border border-transparent hover:border-primary/20 hover:-translate-x-0.5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary-container/20 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {cl.name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-body-md text-xs font-extrabold truncate text-white">{cl.name}</div>
                        <div className="text-[10px] text-on-surface-variant/80 truncate mt-0.5">{cl.email || cl.phone}</div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/60 text-sm">chevron_right</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Next Shooting Calendar */}
            <section className="glass-panel p-6 rounded-2xl border border-outline-variant/30 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="font-label-md text-[10px] uppercase tracking-wider mb-6 text-on-surface-variant font-extrabold">
                {t.nextShootTitle}
              </h3>
              {nextShoot ? (
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-container text-white p-2.5 rounded-2xl min-w-[54px] min-h-[54px] border border-primary/30 shadow-md">
                    <span className="text-lg font-black leading-none">{nextShootDay}</span>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider mt-1">{nextShootMonth}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-body-md text-sm font-extrabold text-white truncate max-w-[170px]">{nextShoot.name}</div>
                    <div className="text-xs text-on-surface-variant/90 mt-1 font-medium flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-[9px] font-bold uppercase tracking-wider text-primary border border-outline-variant/30">{nextShoot.project_type || 'Shoot'}</span>
                      <span className="truncate">• {t.clientLabel} : <span className="text-white/80 font-bold">{nextShoot.pf_clients?.name || t.notAssigned}</span></span>
                    </div>
                    {nextShoot.description && (
                      <div className="text-[10px] text-on-surface-variant/80 mt-2 truncate max-w-[200px] italic border-l-2 border-primary/30 pl-2">
                        "{nextShoot.description}"
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-on-surface-variant">
                  {t.noUpcomingShoot}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Bottom bar for mobile */}
      <MobileNav onNewShootClick={handleOpenNewShootModal} />

      {/* Nouveau Shoot Modal */}
      {showNewShootModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-outline-variant/40 shadow-2xl animate-in scale-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl font-bold text-white">{t.newShootModalTitle}</h3>
              <button 
                onClick={() => setShowNewShootModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateShoot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.projectNameLabel}</label>
                <input
                  type="text"
                  required
                  value={shootName}
                  onChange={(e) => setShootName(e.target.value)}
                  placeholder={PLACEHOLDERS_BY_TYPE[shootType] || "Ex: Session Photo Dakar"}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.eventTypeLabel}</label>
                  <select
                    value={shootType}
                    onChange={(e) => setShootType(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer text-on-surface"
                  >
                    <option value="Mariage" className="bg-surface-container">Mariage</option>
                    <option value="Portrait" className="bg-surface-container">Portrait</option>
                    <option value="Mode" className="bg-surface-container">Mode</option>
                    <option value="Sportif" className="bg-surface-container">Sportif</option>
                    <option value="Paysage" className="bg-surface-container">Paysage</option>
                    <option value="Anniversaire" className="bg-surface-container">Anniversaire</option>
                    <option value="Baptême" className="bg-surface-container">Baptême</option>
                    <option value="Corporate" className="bg-surface-container">Corporate</option>
                    <option value="Immobilier" className="bg-surface-container">Immobilier</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.shootDateLabel}</label>
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.associatedClientLabel}</label>
                <select
                  value={shootClientId}
                  onChange={(e) => setShootClientId(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer text-on-surface"
                >
                  <option value="">{t.selectClientOptional}</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id} className="bg-surface-container">
                      {cl.name} ({cl.email || cl.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.descriptionLabel}</label>
                <textarea
                  value={shootDesc}
                  onChange={(e) => setShootDesc(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewShootModal(false)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  disabled={creatingShoot}
                  className="flex-1 py-3 bg-primary-container text-on-primary-container font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {creatingShoot ? (
                    <span className="w-5 h-5 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
                  ) : (
                    t.createButton
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-green-500/30 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 className="font-display-lg text-lg font-bold text-white mb-2">
              {t.projectCreatedSuccess}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2">
              {t.projectSuccessDesc}
            </p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/dashboard/projects/${createdProjectId}`);
              }}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs shadow-lg"
            >
              {t.accessShootButton}
            </button>
          </div>
        </div>
      )}

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <div 
          onClick={() => setShowUpgradeModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface-container-high border border-primary/30 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default relative"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-on-surface-variant hover:text-white material-symbols-outlined text-xl cursor-pointer"
              >
                close
              </button>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>

            <h3 className="font-display-lg text-2xl font-bold text-white mb-2">
              {lang === 'fr' ? 'Passez à la Version PRO !' : 'Upgrade to PRO Version!'}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-4">
              {lang === 'fr' 
                ? 'Libérez toute la puissance de PhotoFlow AI. Obtenez 50 Go d\'espace de stockage, la retouche par prompt AI, et retirez/personnalisez les filigranes pour vos clients.'
                : 'Unlock the full power of PhotoFlow AI. Get 50 GB of storage space, AI prompt retouching, and remove or customize watermarks for your clients.'}
            </p>

            <div className="w-full space-y-3 mb-6 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/20 text-left text-xs">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? 'Retouche de photos par Prompt AI' : 'AI Prompt photo retouching'}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? '50 Go de stockage cloud sécurisé' : '50 GB of secure cloud storage'}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? 'Filigrane personnalisé ou supprimé' : 'Custom or removed watermarks'}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? 'Support prioritaire 24/7' : 'Priority 24/7 support'}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/settings?upgrade=true')}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              {lang === 'fr' ? 'Passer à la version PRO' : 'Upgrade to PRO version'}
            </button>
            <p className="text-[10px] text-on-surface-variant/70 mt-3 font-semibold">
              {lang === 'fr' ? 'Seulement 12 500 FCFA / mois • Annulable à tout moment' : 'Only 12,500 FCFA / month • Cancel anytime'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
