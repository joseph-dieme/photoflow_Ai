'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useLanguage } from '@/hooks/useLanguage';

const PLACEHOLDERS_BY_TYPE: Record<string, Record<'fr' | 'en', string>> = {
  Mariage: { fr: "Ex: Mariage de Bineta & Fallou", en: "e.g., Wedding of Bineta & Fallou" },
  Portrait: { fr: "Ex: Portrait de Amina", en: "e.g., Portrait of Amina" },
  Mode: { fr: "Ex: Shooting Mode Almadies", en: "e.g., Almadies Fashion Shoot" },
  Sportif: { fr: "Ex: Match de Football Ngor", en: "e.g., Ngor Football Match" },
  Paysage: { fr: "Ex: Paysage Coucher de Soleil Lac Rose", en: "e.g., Pink Lake Sunset Landscape" },
  Anniversaire: { fr: "Ex: Anniversaire de Moussa", en: "e.g., Moussa's Birthday" },
  Baptême: { fr: "Ex: Baptême de Awa", en: "e.g., Awa's Baptism" },
  Corporate: { fr: "Ex: Événement Corporate Orange", en: "e.g., Orange Corporate Event" },
  Immobilier: { fr: "Ex: Shooting Villa Almadies", en: "e.g., Almadies Villa Shoot" },
};

const translations = {
  fr: {
    title: 'Vos Shoots & Projets',
    subtitle: 'Gérez vos imports, organisez vos galeries et livrez vos clients.',
    newShoot: 'Nouveau Shoot',
    all: 'Tous',
    noProjectTitle: 'Aucun projet trouvé',
    noProjectDesc: "Vous n'avez pas encore de shoot créé dans cette catégorie. Commencez dès maintenant !",
    createProjectBtn: 'Créer un projet',
    photos: 'photos',
    noDesc: 'Aucune description fournie pour ce projet photographique.',
    noClient: 'Sans client',
    unplanned: 'Non planifié',
    newShootTitle: 'Nouveau Shoot Photo',
    shootNameLabel: 'Nom du Projet',
    shootTypeLabel: 'Type de shooting',
    shootDateLabel: 'Date du Shoot',
    clientLabel: 'Client Destinataire',
    clientSelectPlaceholder: 'Sélectionner un client (Optionnel)',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Notes importantes (ex: objectif 50mm, repérages...)',
    cancel: 'Annuler',
    createShootBtn: 'Créer le Shoot',
    creating: 'Création...',
    successTitle: 'Projet Créé avec Succès !',
    successDesc: 'Le shooting a été configuré et sa galerie sécurisée a été générée. Vous pouvez maintenant y importer vos clichés pour lancer les retouches IA.',
    successBtn: 'Accéder au shooting',
    errorCreate: 'Erreur lors de la création du shoot.',
    // Project types translations
    type_all: 'Tous',
    type_Mariage: 'Mariage',
    type_Portrait: 'Portrait',
    type_Mode: 'Mode',
    type_Sportif: 'Sportif',
    type_Paysage: 'Paysage',
    type_Anniversaire: 'Anniversaire',
    type_Baptême: 'Baptême',
    type_Corporate: 'Corporate',
    type_Immobilier: 'Immobilier',
  },
  en: {
    title: 'Your Shoots & Projects',
    subtitle: 'Manage your imports, organize your galleries and deliver to your clients.',
    newShoot: 'New Shoot',
    all: 'All',
    noProjectTitle: 'No projects found',
    noProjectDesc: "You don't have any shoots created in this category yet. Start now!",
    createProjectBtn: 'Create a project',
    photos: 'photos',
    noDesc: 'No description provided for this photography project.',
    noClient: 'No client',
    unplanned: 'Not planned',
    newShootTitle: 'New Photo Shoot',
    shootNameLabel: 'Project Name',
    shootTypeLabel: 'Shoot Type',
    shootDateLabel: 'Shoot Date',
    clientLabel: 'Client Recipient',
    clientSelectPlaceholder: 'Select a client (Optional)',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Important notes (e.g. 50mm lens, scouting...)',
    cancel: 'Cancel',
    createShootBtn: 'Create Shoot',
    creating: 'Creating...',
    successTitle: 'Project Created Successfully!',
    successDesc: 'The shoot has been set up and its secure gallery generated. You can now import your shots to launch AI edits.',
    successBtn: 'Go to shoot',
    errorCreate: 'Error creating the shoot.',
    // Project types translations
    type_all: 'All',
    type_Mariage: 'Wedding',
    type_Portrait: 'Portrait',
    type_Mode: 'Fashion',
    type_Sportif: 'Sports',
    type_Paysage: 'Landscape',
    type_Anniversaire: 'Birthday',
    type_Baptême: 'Baptism',
    type_Corporate: 'Corporate',
    type_Immobilier: 'Real Estate',
  }
};

const PROJECT_TYPES_CONFIG: Record<string, { icon: string; color: string }> = {
  all: { icon: 'apps', color: 'text-primary bg-primary/10 border-primary/20' },
  Mariage: { icon: 'favorite', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  Portrait: { icon: 'face', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  Mode: { icon: 'apparel', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  Sportif: { icon: 'sports_soccer', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  Paysage: { icon: 'landscape', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  Anniversaire: { icon: 'cake', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  Baptême: { icon: 'child_care', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  Corporate: { icon: 'business', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  Immobilier: { icon: 'home', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
};

export default function ProjectsPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Data States
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [filteredType, setFilteredType] = useState<string>('all');
  
  // UI States
  const [showNewShootModal, setShowNewShootModal] = useState(false);
  const [creatingShoot, setCreatingShoot] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState('');
  
  // Form States
  const [shootName, setShootName] = useState('');
  const [shootClientId, setShootClientId] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [shootDesc, setShootDesc] = useState('');
  const [shootType, setShootType] = useState('Mariage');

  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchProjectsAndClients(session.user.id);
      }
    });
  }, [router]);

  // Sync the new shoot form default type with the active category filter
  useEffect(() => {
    if (showNewShootModal && filteredType !== 'all') {
      setTimeout(() => setShootType(filteredType), 0);
    }
  }, [showNewShootModal, filteredType]);

  async function fetchProjectsAndClients(userId: string) {
    setLoading(true);
    try {
      // Fetch profile, projects, and clients in parallel
      const [
        { data: profileData },
        { data: projData },
        { data: clientsData }
      ] = await Promise.all([
        supabase.from('pf_profiles').select('*').eq('id', userId).single(),
        supabase.from('pf_projects').select('*, pf_clients(name), pf_photos(original_url, created_at)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('pf_clients').select('*').eq('user_id', userId)
      ]);
      
      if (profileData) {
        setProfile(profileData);
      }
      setProjects(projData || []);
      setClients(clientsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
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

      // Auto-generate secure gallery slug
      const slug = shootName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      await supabase
        .from('pf_galleries')
        .insert({
          project_id: data.id,
          url_slug: slug,
          is_protected: false,
        });

      setShowNewShootModal(false);
      setShootName('');
      setShootClientId('');
      setShootDate('');
      setShootDesc('');
      setCreatedProjectId(data.id);
      setShowSuccessModal(true);
      fetchProjectsAndClients(user.id);
    } catch (err) {
      console.error('Error creating shoot:', err);
      alert(t.errorCreate);
    } finally {
      setCreatingShoot(false);
    }
  };

  const projectTypes = ['all', 'Mariage', 'Portrait', 'Mode', 'Sportif', 'Paysage', 'Anniversaire', 'Baptême', 'Corporate', 'Immobilier'];

  const getFilteredProjects = () => {
    if (filteredType === 'all') return projects;
    return projects.filter((p) => p.project_type === filteredType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container relative">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-container/5 blur-[130px] pointer-events-none z-0" />

      <Navigation />
      
      <Sidebar 
        onNewShootClick={handleOpenNewShootModal} 
        activeProjectName={projects[0]?.name || 'PhotoFlow'} 
      />

      <main className="md:ml-[280px] pt-24 px-6 md:px-margin-desktop pb-24 bg-transparent min-h-screen relative z-10">
        {/* Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display-lg text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
              {t.title}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">{t.subtitle}</p>
          </div>
          
          <button
            onClick={handleOpenNewShootModal}
            className="bg-gradient-to-r from-primary to-primary-container hover:from-primary/90 hover:to-primary-container/90 text-white font-semibold px-5 py-3 rounded-xl active:scale-98 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 cursor-pointer self-start md:self-auto shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            {t.newShoot}
          </button>
        </header>

        {/* Filter categories bar */}
        <div className="glass-panel p-2.5 rounded-2xl border border-outline-variant/30 mb-8 overflow-x-auto custom-scrollbar flex gap-2 backdrop-blur-md bg-surface-container/10 select-none">
          {projectTypes.map((type) => {
            const translationKey = `type_${type}` as keyof typeof t;
            const typeLabel = t[translationKey] || type;
            const config = PROJECT_TYPES_CONFIG[type] || PROJECT_TYPES_CONFIG.all;
            const isActive = filteredType === type;
            
            return (
              <button
                key={type}
                onClick={() => setFilteredType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-102'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high/40'
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${isActive ? 'text-white' : 'text-on-surface-variant/70'}`}>
                  {config.icon}
                </span>
                {typeLabel}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFilteredProjects().length === 0 ? (
            <div className="col-span-full glass-panel p-16 rounded-3xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/40 bg-surface-container/5 backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-primary">
                <span className="material-symbols-outlined text-3xl">folder_open</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-white mb-2">{t.noProjectTitle}</h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
                {t.noProjectDesc}
              </p>
              <button
                onClick={handleOpenNewShootModal}
                className="bg-primary text-on-primary hover:bg-primary/90 font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 active:scale-98 cursor-pointer"
              >
                {t.createProjectBtn}
              </button>
            </div>
          ) : (
            getFilteredProjects().map((proj, idx) => {
              const config = PROJECT_TYPES_CONFIG[proj.project_type] || PROJECT_TYPES_CONFIG.all;
              const photoCount = proj.pf_photos?.length || 0;
              
              // Get the newest image URL as the cover photo
              const coverUrl = (proj.pf_photos && proj.pf_photos.length > 0)
                ? [...proj.pf_photos].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].original_url
                : (idx % 2 === 0
                    ? "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
                    
              return (
                <div
                  key={proj.id}
                  onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                  className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 bg-surface-container/5 transition-all duration-300 cursor-pointer flex flex-col group relative"
                >
                  {/* Subtle top glow line */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/50 to-primary-container/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                  {/* Cover Image preview */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-surface-container-highest shrink-0">
                    <img
                      alt={proj.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                      src={coverUrl}
                      loading="lazy"
                    />
                    
                    {/* Shadow overlay gradient on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                    {/* Floating Shoot Type Badge */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-[13px] ${config.color.split(' ')[0]}`}>
                        {config.icon}
                      </span>
                      <span>
                        {t[`type_${proj.project_type}` as keyof typeof t] || proj.project_type || 'Shoot'}
                      </span>
                    </div>

                    {/* Floating Photo Count Badge */}
                    <div className="absolute bottom-4 right-4 bg-primary/15 backdrop-blur-md border border-primary/30 text-primary px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                      <span>{photoCount} {t.photos}</span>
                    </div>
                  </div>

                  {/* Project Info details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-md text-base text-white font-bold mb-1.5 truncate group-hover:text-primary transition-colors duration-300" title={proj.name}>
                        {proj.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant/80 line-clamp-2 min-h-[32px] mb-4 leading-relaxed">
                        {proj.description || t.noDesc}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="material-symbols-outlined text-sm text-primary/70 shrink-0">person</span>
                        <span className="truncate max-w-[140px] text-[11px]" title={proj.pf_clients?.name || t.noClient}>
                          {proj.pf_clients?.name || <span className="italic text-on-surface-variant/40">{t.noClient}</span>}
                        </span>
                      </span>
                      
                      <span className="flex items-center gap-1 text-[11px] shrink-0 text-on-surface-variant/80">
                        <span className="material-symbols-outlined text-sm text-primary/70">calendar_month</span>
                        <span>
                          {proj.date 
                            ? new Date(proj.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                            : <span className="italic text-on-surface-variant/40">{t.unplanned}</span>
                          }
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <MobileNav onNewShootClick={handleOpenNewShootModal} />

      {/* New Shoot Modal */}
      {showNewShootModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container/15 shadow-2xl animate-in scale-in duration-300 relative overflow-hidden">
            {/* Subtle top glow border */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary to-primary-container" />
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">add_photo_alternate</span>
                <h3 className="font-headline-md text-xl font-bold text-white">{t.newShootTitle}</h3>
              </div>
              <button 
                onClick={() => setShowNewShootModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container/50 hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateShoot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">edit</span>
                  {t.shootNameLabel} <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shootName}
                  onChange={(e) => setShootName(e.target.value)}
                  placeholder={PLACEHOLDERS_BY_TYPE[shootType] ? PLACEHOLDERS_BY_TYPE[shootType][lang] : "Ex: Session Photo"}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/40 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">category</span>
                    {t.shootTypeLabel}
                  </label>
                  <select
                    value={shootType}
                    onChange={(e) => setShootType(e.target.value)}
                    className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-white cursor-pointer"
                  >
                    <option value="Mariage">{t.type_Mariage}</option>
                    <option value="Portrait">{t.type_Portrait}</option>
                    <option value="Mode">{t.type_Mode}</option>
                    <option value="Sportif">{t.type_Sportif}</option>
                    <option value="Paysage">{t.type_Paysage}</option>
                    <option value="Anniversaire">{t.type_Anniversaire}</option>
                    <option value="Baptême">{t.type_Baptême}</option>
                    <option value="Corporate">{t.type_Corporate}</option>
                    <option value="Immobilier">{t.type_Immobilier}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">calendar_month</span>
                    {t.shootDateLabel}
                  </label>
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">person_pin</span>
                  {t.clientLabel}
                </label>
                <select
                  value={shootClientId}
                  onChange={(e) => setShootClientId(e.target.value)}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-white cursor-pointer"
                >
                  <option value="">{t.clientSelectPlaceholder}</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">description</span>
                  {t.descriptionLabel}
                </label>
                <textarea
                  value={shootDesc}
                  onChange={(e) => setShootDesc(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/40 text-white resize-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewShootModal(false)}
                  className="flex-1 py-3 border border-outline-variant hover:bg-surface-container-highest text-white font-semibold rounded-xl transition-all active:scale-98 cursor-pointer text-sm"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={creatingShoot}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer text-sm"
                >
                  {creatingShoot ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  ) : (
                    t.createShootBtn
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-green-500/20 bg-surface-container/15 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-green-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5 text-green-400 shadow-inner">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 className="font-display-lg text-lg font-bold text-white mb-2">
              {t.successTitle}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2 leading-relaxed">
              {t.successDesc}
            </p>
 
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/dashboard/projects/${createdProjectId}`);
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-green-950/20"
            >
              {t.successBtn}
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
            className="w-full max-w-md glass-panel border border-primary/30 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default relative overflow-hidden bg-surface-container/15"
          >
            {/* Bright Pro glow indicator */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container/50 hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400 shadow-inner">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>

            <h3 className="font-display-lg text-2xl font-bold text-white mb-2">
              {lang === 'fr' ? 'Passez à la Version PRO !' : 'Upgrade to PRO Version!'}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-4 leading-relaxed">
              {lang === 'fr' 
                ? 'Libérez toute la puissance de PhotoFlow AI. Obtenez 50 Go d\'espace de stockage, la retouche par prompt AI, et retirez ou personnalisez les filigranes de vos galeries.'
                : 'Unlock the full power of PhotoFlow AI. Get 50 GB of storage space, AI prompt retouching, and remove or customize watermarks for your galleries.'}
            </p>

            <div className="w-full space-y-3 mb-6 bg-background/30 p-4 rounded-xl border border-outline-variant/15 text-left text-xs">
              <div className="flex items-center gap-2.5 text-white">
                <span className="material-symbols-outlined text-amber-500 text-sm font-bold">check_circle</span>
                <span>{lang === 'fr' ? 'Retouche de photos par Prompt AI' : 'AI Prompt photo retouching'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-white">
                <span className="material-symbols-outlined text-amber-500 text-sm font-bold">check_circle</span>
                <span>{lang === 'fr' ? '50 Go de stockage cloud sécurisé' : '50 GB of secure cloud storage'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-white">
                <span className="material-symbols-outlined text-amber-500 text-sm font-bold">check_circle</span>
                <span>{lang === 'fr' ? 'Filigrane personnalisé ou supprimé' : 'Custom or removed watermarks'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-white">
                <span className="material-symbols-outlined text-amber-500 text-sm font-bold">check_circle</span>
                <span>{lang === 'fr' ? 'Support prioritaire 24/7' : 'Priority 24/7 support'}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/settings?upgrade=true')}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-background font-bold py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-lg shadow-amber-500/20"
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
