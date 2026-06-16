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
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container">
      <Navigation />
      
      <Sidebar 
        onNewShootClick={handleOpenNewShootModal} 
        activeProjectName={projects[0]?.name || 'PhotoFlow'} 
      />

      <main className="md:ml-[280px] pt-24 px-6 md:px-margin-desktop pb-24 bg-background min-h-screen">
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-display-lg text-3xl font-bold text-on-surface mb-2">{t.title}</h1>
            <p className="text-on-surface-variant font-body-md">{t.subtitle}</p>
          </div>
          <button
            onClick={handleOpenNewShootModal}
            className="bg-primary-container text-on-primary-container font-semibold px-5 py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            {t.newShoot}
          </button>
        </header>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/30 pb-4">
          {projectTypes.map((type) => {
            const translationKey = `type_${type}` as keyof typeof t;
            const typeLabel = t[translationKey] || type;
            return (
              <button
                key={type}
                onClick={() => setFilteredType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  filteredType === type
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {typeLabel}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredProjects().length === 0 ? (
            <div className="col-span-full glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/50">
              <span className="material-symbols-outlined text-outline text-6xl mb-4">folder_open</span>
              <h3 className="font-headline-md text-lg font-bold text-white mb-2">{t.noProjectTitle}</h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
                {t.noProjectDesc}
              </p>
              <button
                onClick={handleOpenNewShootModal}
                className="bg-primary-container text-on-primary-container px-4 py-2.5 rounded-lg text-xs font-semibold"
              >
                {t.createProjectBtn}
              </button>
            </div>
          ) : (
            getFilteredProjects().map((proj, idx) => (
              <div
                key={proj.id}
                onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                className="glass-panel rounded-2xl overflow-hidden hover:border-primary/20 border border-outline-variant/20 hover:shadow-2xl transition-all cursor-pointer flex flex-col group"
              >
                {/* Cover Image preview */}
                <div className="aspect-[16/10] relative overflow-hidden bg-surface-container-highest">
                  <img
                    alt={proj.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={
                      (proj.pf_photos && proj.pf_photos.length > 0)
                        ? [...proj.pf_photos].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].original_url
                        : (idx % 2 === 0
                            ? "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80"
                            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80")
                    }
                  />
                  <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {t[`type_${proj.project_type}` as keyof typeof t] || proj.project_type || 'Shoot'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md">
                    {proj.pf_photos?.length || 0} {t.photos}
                  </div>
                </div>

                {/* Project Info details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline-md text-lg text-white font-bold mb-1 truncate">{proj.name}</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 min-h-[32px] mb-4">
                      {proj.description || t.noDesc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span className="truncate max-w-[120px]">{proj.pf_clients?.name || t.noClient}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                      <span>{proj.date ? new Date(proj.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : t.unplanned}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <MobileNav onNewShootClick={handleOpenNewShootModal} />

      {/* New Shoot Modal */}
      {showNewShootModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-outline-variant/40 shadow-2xl animate-in scale-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl font-bold text-white">{t.newShootTitle}</h3>
              <button 
                onClick={() => setShowNewShootModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateShoot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.shootNameLabel}</label>
                <input
                  type="text"
                  required
                  value={shootName}
                  onChange={(e) => setShootName(e.target.value)}
                  placeholder={PLACEHOLDERS_BY_TYPE[shootType] ? PLACEHOLDERS_BY_TYPE[shootType][lang] : "Ex: Session Photo"}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.shootTypeLabel}</label>
                  <select
                    value={shootType}
                    onChange={(e) => setShootType(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.shootDateLabel}</label>
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.clientLabel}</label>
                <select
                  value={shootClientId}
                  onChange={(e) => setShootClientId(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                >
                  <option value="">{t.clientSelectPlaceholder}</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
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
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={creatingShoot}
                  className="flex-1 py-3 bg-primary-container text-on-primary-container font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {creatingShoot ? (
                    <span className="w-5 h-5 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-green-500/30 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 className="font-display-lg text-lg font-bold text-white mb-2">
              {t.successTitle}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2">
              {t.successDesc}
            </p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/dashboard/projects/${createdProjectId}`);
              }}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs shadow-lg"
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
