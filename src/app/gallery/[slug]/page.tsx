/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { applyAdjustments, DEFAULT_ADJUSTMENTS } from '@/lib/image-processing';

interface WatermarkedImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  watermarkText?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function WatermarkedImage({ src, thumbnailSrc, alt, watermarkText, className, onClick }: WatermarkedImageProps) {
  const [displaySrc, setDisplaySrc] = useState(thumbnailSrc || src);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadImages = async () => {
      // 1. If watermark text is not present
      if (!watermarkText) {
        if (thumbnailSrc && src !== thumbnailSrc) {
          setDisplaySrc(thumbnailSrc);
          // Load full-res in the background
          const img = new Image();
          img.onload = () => {
            if (active) setDisplaySrc(src);
          };
          img.src = src;
        } else {
          setDisplaySrc(src);
        }
        return;
      }

      // 2. If watermark text is present
      // If src and thumbnailSrc are the same, or thumbnailSrc is not provided, watermark only once
      if (!thumbnailSrc || src === thumbnailSrc) {
        setLoading(true);
        try {
          const watermarked = await applyAdjustments(src, DEFAULT_ADJUSTMENTS, watermarkText, true);
          if (active) {
            setDisplaySrc(watermarked);
            setLoading(false);
          }
        } catch (err) {
          console.error("Watermarking failed, fallback to raw src", err);
          if (active) {
            setDisplaySrc(src);
            setLoading(false);
          }
        }
        return;
      }

      // If they are different, watermark thumbnail first, then full-res in background
      setLoading(true);
      try {
        const watermarkedThumb = await applyAdjustments(thumbnailSrc, DEFAULT_ADJUSTMENTS, watermarkText, true);
        if (active) {
          setDisplaySrc(watermarkedThumb);
          setLoading(false); // Stop showing loading spinner
        }
      } catch (err) {
        console.error("Watermark thumb failed", err);
      }

      try {
        const watermarkedFull = await applyAdjustments(src, DEFAULT_ADJUSTMENTS, watermarkText, true);
        if (active) {
          setDisplaySrc(watermarkedFull);
          setLoading(false);
        }
      } catch (err) {
        console.error("Watermark full failed, fallback to raw src", err);
        if (active && !displaySrc) {
          setDisplaySrc(src);
          setLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      active = false;
    };
  }, [src, thumbnailSrc, watermarkText]);

  if (loading) {
    return (
      <div className={`relative flex items-center justify-center min-h-[150px] bg-surface-container-low rounded-xl ${className}`}>
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <img 
      src={displaySrc} 
      alt={alt} 
      className={className} 
      onClick={onClick}
    />
  );
}

const translations = {
  fr: {
    title: "Galerie Client",
    securedAccess: "Accès Sécurisé",
    downloadAll: "Télécharger tout",
    defaultDesc: "Découvrez vos souvenirs photographiques magnifiés. Téléchargez vos clichés en HD ou marquez vos favoris.",
    createdBy: "Créé par :",
    noPhotos: "Le photographe n'a pas encore ajouté de photos dans cette galerie.",
    markFavorite: "Marquer en Favori",
    downloadPhoto: "Télécharger cette photo",
    deliveryClient: "PhotoFlow AI Delivery Client",
    rightsReserved: "© 2026. Tous droits réservés.",
    share: "Partager :",
    copied: "Copié",
    copyLink: "Lien",
    email: "Email",
    prevPhoto: "Photo précédente",
    nextPhoto: "Photo suivante",
    favorite: "Favori",
    download: "Télécharger",
    passcodeProtected: "Contenu protégé par mot de passe",
    notifDownloadStartedTitle: "Téléchargement Commencé",
    notifDownloadStartedMsg: "Préparation de l'album en cours... Les photos vont être téléchargées.",
    notifPrepDownloadTitle: "Préparation du téléchargement",
    notifPrepDownloadMsg: "Application du filigrane de protection...",
    notifClose: "Fermer",
    galleryNotFound: "Galerie Introuvable",
    galleryNotFoundDesc: "Le lien de livraison client est invalide ou la galerie a été archivée par le photographe.",
    backToHome: "Retour à l'accueil",
    secureTitle: "Galerie Sécurisée",
    secureDesc: "Cette galerie est sécurisée. Veuillez saisir le mot de passe de livraison.",
    passcodeIncorrect: "Code d'accès incorrect. Veuillez vérifier auprès de votre photographe.",
    passcodePlaceholder: "Entrez le code",
    passcodeSubmit: "Accéder à la galerie",
    passcodeLabel: "Mot de passe de la galerie"
  },
  en: {
    title: "Client Gallery",
    securedAccess: "Secured Access",
    downloadAll: "Download All",
    defaultDesc: "Discover your magnified photographic memories. Download your shots in HD or mark your favorites.",
    createdBy: "Created by:",
    noPhotos: "The photographer has not added any photos to this gallery yet.",
    markFavorite: "Mark as Favorite",
    downloadPhoto: "Download this photo",
    deliveryClient: "PhotoFlow AI Client Delivery",
    rightsReserved: "© 2026. All rights reserved.",
    share: "Share:",
    copied: "Copied",
    copyLink: "Link",
    email: "Email",
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    favorite: "Favorite",
    download: "Download",
    passcodeProtected: "Password protected content",
    notifDownloadStartedTitle: "Download Started",
    notifDownloadStartedMsg: "Preparing album... Photos will be downloaded shortly.",
    notifPrepDownloadTitle: "Preparing download",
    notifPrepDownloadMsg: "Applying protective watermark...",
    notifClose: "Close",
    galleryNotFound: "Gallery Not Found",
    galleryNotFoundDesc: "The client delivery link is invalid or the gallery has been archived by the photographer.",
    backToHome: "Back to Home",
    secureTitle: "Secured Gallery",
    secureDesc: "This gallery is secure. Please enter the delivery password.",
    passcodeIncorrect: "Incorrect passcode. Please check with your photographer.",
    passcodePlaceholder: "Enter passcode",
    passcodeSubmit: "Access Gallery",
    passcodeLabel: "Gallery Password"
  }
};

export default function ClientGalleryPage() {
  const routeParams = useParams();
  const slugFromRoute = routeParams.slug as string;
  const slug = slugFromRoute || '';
  const [loading, setLoading] = useState(true);
  
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
  
  // Data States
  const [gallery, setGallery] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);

  // Passcode verification states
  const [inputPasscode, setInputPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sharing states
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null); // For lightbox

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

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  }, []);

  const fetchGalleryData = useCallback(async (gallerySlug: string) => {
    setLoading(true);
    try {
      // 1. Fetch gallery by slug
      const { data: galleryData, error: galleryError } = await supabase
        .from('pf_galleries')
        .select('*')
        .eq('url_slug', gallerySlug)
        .single();

      if (galleryError) throw galleryError;
      setGallery(galleryData);

      // If gallery is not protected, auto-unlock it
      if (!galleryData.is_protected) {
        setIsUnlocked(true);
      } else {
        setShowToast(true);
        // Automatically hide passcode notification toast after 5 seconds
        setTimeout(() => setShowToast(false), 5000);
      }

      // 2. Fetch Project details
      const { data: projectData } = await supabase
        .from('pf_projects')
        .select('*, pf_profiles(full_name, plan, custom_watermark_url)')
        .eq('id', galleryData.project_id)
        .single();
      setProject(projectData);

      // 3. Fetch Photos (public client can read photos if gallery exists - handled by our RLS policy)
      const { data: photosData } = await supabase
        .from('pf_photos')
        .select('*')
        .eq('project_id', galleryData.project_id)
        .order('created_at', { ascending: true });
      
      setPhotos(photosData || []);

    } catch (err) {
      console.error('Error loading gallery details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slugFromRoute) {
      setTimeout(() => {
        fetchGalleryData(slugFromRoute);
      }, 0);
    }
  }, [slugFromRoute, fetchGalleryData]);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(false);

    if (inputPasscode === gallery.password_hash) {
      setIsUnlocked(true);
      setShowToast(false);
    } else {
      setPasscodeError(true);
    }
  };

  const getWatermarkText = () => {
    if (!gallery?.apply_watermark) return undefined;
    const prof = project?.pf_profiles;
    if (!prof) return undefined;
    if (prof.plan === 'pro' && prof.custom_watermark_url) {
      return prof.custom_watermark_url;
    }
    return 'PhotoFlow AI - Sélection';
  };

  const triggerDownload = async (url: string, filename: string) => {
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = localUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(localUrl);
      } catch (err) {
        console.error('Download failed, opening in new tab:', err);
        window.open(url, '_blank');
      }
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) return;
    const watermarkText = getWatermarkText();
    
    showNotification('info', t.notifDownloadStartedTitle, t.notifDownloadStartedMsg);
    
    for (const p of photos) {
      let url = p.processed_url || p.original_url;
      if (watermarkText) {
        try {
          let formatMime: 'image/jpeg' | 'image/webp' | 'image/png' | undefined = undefined;
          if (p.filename) {
            const lowerName = p.filename.toLowerCase();
            if (lowerName.endsWith('.png')) formatMime = 'image/png';
            else if (lowerName.endsWith('.webp')) formatMime = 'image/webp';
            else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) formatMime = 'image/jpeg';
          }
          url = await applyAdjustments(url, DEFAULT_ADJUSTMENTS, watermarkText, false, formatMime);
        } catch (err) {
          console.error("Watermark download error", err);
        }
      }
      await triggerDownload(url, p.filename);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const handleDownloadSingle = async (photo: any, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent lightbox trigger
    const watermarkText = getWatermarkText();
    
    let downloadUrl = photo.processed_url || photo.original_url;
    if (watermarkText) {
      showNotification('info', t.notifPrepDownloadTitle, t.notifPrepDownloadMsg);
      try {
        let formatMime: 'image/jpeg' | 'image/webp' | 'image/png' | undefined = undefined;
        if (photo.filename) {
          const lowerName = photo.filename.toLowerCase();
          if (lowerName.endsWith('.png')) formatMime = 'image/png';
          else if (lowerName.endsWith('.webp')) formatMime = 'image/webp';
          else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) formatMime = 'image/jpeg';
        }
        downloadUrl = await applyAdjustments(downloadUrl, DEFAULT_ADJUSTMENTS, watermarkText, false, formatMime);
      } catch (err) {
        console.error("Failed to apply watermark for download", err);
      }
    }

    await triggerDownload(downloadUrl, photo.filename);
  };

  const handleToggleFavorite = async (photo: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('pf_photos')
        .update({ is_favorite: !photo.is_favorite })
        .eq('id', photo.id);

      if (error) throw error;
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_favorite: !p.is_favorite } : p))
      );
    } catch (err) {
      console.error('Error marking photo favorite:', err);
    }
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/gallery/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return encodeURIComponent(`${origin}/gallery/${slug}`);
  };

  const handleNextPhoto = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto || photos.length <= 1) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  }, [selectedPhoto, photos]);

  const handlePrevPhoto = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto || photos.length <= 1) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
  }, [selectedPhoto, photos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto, photos, handleNextPhoto, handlePrevPhoto]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-error text-6xl mb-4">cancel</span>
          <h1 className="font-display-lg text-2xl font-bold text-white mb-2">{t.galleryNotFound}</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            {t.galleryNotFoundDesc}
          </p>
          <Link href="/" className="bg-primary-container text-on-primary-container font-semibold px-4 py-2 rounded-lg text-xs">
            {t.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  // Render Passcode Gate if protected and not unlocked yet
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 hero-glow">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-outline-variant/40 shadow-2xl relative">
          {/* Language Toggle in Gate */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-[11px] font-bold border border-outline-variant hover:border-primary rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all uppercase cursor-pointer"
              title="Changer de langue / Switch Language"
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>

          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary text-5xl mb-4">lock</span>
            <h1 className="font-display-lg text-2xl font-bold text-white mb-2">{project?.name || t.title}</h1>
            <p className="text-on-surface-variant text-xs">{t.secureDesc}</p>
          </div>

          {passcodeError && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{t.passcodeIncorrect}</span>
            </div>
          )}

          <form onSubmit={handleVerifyPasscode} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                {t.passcodeLabel}
              </label>
              <input
                id="passcode"
                type="password"
                required
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                placeholder={t.passcodePlaceholder}
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-center font-bold tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              {t.passcodeSubmit}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 md:px-margin-desktop h-16 w-full fixed top-0 z-50 bg-surface-container/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-6">
          <span className="font-headline-md text-lg font-bold text-primary">PhotoFlow AI</span>
          <div className="h-6 w-[1px] bg-outline-variant hidden md:block"></div>
          <span className="font-headline-md text-sm text-on-surface hidden md:block font-bold truncate max-w-[200px]" title={project?.name}>
            {project?.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-[11px] font-bold border border-outline-variant hover:border-primary rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all uppercase cursor-pointer"
            title="Changer de langue / Switch Language"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full border border-outline-variant/50 text-[10px] font-bold text-primary">
            <span className="material-symbols-outlined text-xs">verified_user</span>
            <span className="hidden sm:inline">{t.securedAccess}</span>
          </div>
          <button 
            onClick={handleDownloadAll}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold text-xs font-label-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span className="hidden sm:inline">{t.downloadAll}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-32 px-6 md:px-margin-desktop max-w-[1600px] mx-auto w-full">
        {/* Banner details */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="font-display-lg text-4xl font-bold text-white mb-2">{project?.name}</h1>
          <p className="font-body-lg text-sm text-on-surface-variant max-w-2xl">
            {project?.description || t.defaultDesc}
          </p>
          <p className="text-xs text-outline mt-3">
            {t.createdBy} {project?.pf_profiles?.full_name || (lang === 'fr' ? 'Votre Photographe' : 'Your Photographer')}
          </p>
        </div>

        {/* Masonry Image Grid */}
        {photos.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">image</span>
            <p className="text-on-surface-variant text-sm">{t.noPhotos}</p>
          </div>
        ) : (
          <div className="masonry">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="masonry-item group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:scale-[1.01] cursor-pointer"
              >
                <WatermarkedImage 
                  alt={photo.filename} 
                  src={photo.metadata?.processed_thumbnail_url || photo.metadata?.thumbnail_url || photo.processed_url || photo.original_url}
                  thumbnailSrc={photo.metadata?.processed_thumbnail_url || photo.metadata?.thumbnail_url}
                  watermarkText={getWatermarkText()}
                  className="w-full h-auto object-cover pointer-events-none"
                />

                {/* Hover Details Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={(e) => handleToggleFavorite(photo, e)}
                      className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white hover:text-primary transition-all cursor-pointer"
                      title={t.markFavorite}
                    >
                      <span 
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: photo.is_favorite ? "'FILL' 1" : undefined }}
                      >
                        favorite
                      </span>
                    </button>
                    <button 
                      onClick={(e) => handleDownloadSingle(photo, e)}
                      className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white hover:text-primary transition-all cursor-pointer"
                      title={t.downloadPhoto}
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                  
                  {/* Photo details */}
                  <div className="glass-panel p-2 rounded-lg text-white/90 text-[10px] font-mono flex justify-between items-center">
                    <span>ISO {photo.metadata?.iso || 100} • {photo.metadata?.shutter || '1/250'} • {photo.metadata?.aperture || 'f/1.8'}</span>
                    <span className="material-symbols-outlined text-[14px]">info</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Sharing Footer dashboard */}
      <footer className="w-full py-6 px-6 md:px-margin-desktop bg-surface-container/95 border-t border-outline-variant fixed bottom-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-body-sm text-[10px] text-on-surface-variant font-bold">{t.deliveryClient}</p>
            <p className="text-[10px] text-outline mt-0.5">{t.rightsReserved}</p>
          </div>

          <div className="flex items-center gap-4 bg-background p-1.5 rounded-full border border-outline-variant/50 max-w-full overflow-x-auto scrollbar-hide">
            <span className="px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0">{t.share}</span>
            <div className="flex gap-1.5 shrink-0">
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-highest rounded-full text-on-surface text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
                {copiedLink ? t.copied : t.copyLink}
              </button>
              <a 
                href={`https://wa.me/?text=Découvrez%20les%20photos%20du%20projet%20${encodeURIComponent(project?.name)}%20ici%20:%20${getShareUrl()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-highest rounded-full text-on-surface text-xs font-semibold hover:bg-green-600 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                WhatsApp
              </a>
              <a 
                href={`mailto:?subject=Photos%20du%20projet%20${encodeURIComponent(project?.name)}&body=Bonjour,%20vous%20pouvez%20consulter%20les%20photos%20de%20notre%20shoot%20ici%20:%20${getShareUrl()}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-highest rounded-full text-on-surface text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {t.email}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal for individual photo preview */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button 
            className="absolute top-4 right-4 text-white/75 hover:text-white p-2 text-2xl material-symbols-outlined cursor-pointer z-[120]"
            onClick={() => setSelectedPhoto(null)}
          >
            close
          </button>
          
          {/* Left Arrow Button */}
          <button 
            onClick={handlePrevPhoto}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer z-[110]"
            title={t.prevPhoto}
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>
          
          <WatermarkedImage 
            src={selectedPhoto.processed_url || selectedPhoto.original_url} 
            thumbnailSrc={selectedPhoto.metadata?.processed_thumbnail_url || selectedPhoto.metadata?.thumbnail_url}
            alt={selectedPhoto.filename}
            watermarkText={getWatermarkText()}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
          />

          {/* Right Arrow Button */}
          <button 
            onClick={handleNextPhoto}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer z-[110]"
            title={t.nextPhoto}
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>

          <div className="mt-4 glass-panel px-6 py-2.5 rounded-full text-white/90 text-xs font-semibold flex gap-6 cursor-default z-[110]" onClick={(e) => e.stopPropagation()}>
            <span className="truncate max-w-[150px] font-bold">{selectedPhoto.filename}</span>
            <span>ISO {selectedPhoto.metadata?.iso || 100} • {selectedPhoto.metadata?.shutter || '1/250'} • {selectedPhoto.metadata?.aperture || 'f/1.8'}</span>
            <button 
              onClick={(e) => handleToggleFavorite(selectedPhoto, e)}
              className="text-primary hover:scale-105 transition-transform flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: selectedPhoto.is_favorite ? "'FILL' 1" : undefined }}>
                favorite
              </span>
              {t.favorite}
            </button>
            <button 
              onClick={(e) => handleDownloadSingle(selectedPhoto, e)}
              className="text-white hover:text-primary transition-colors flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm mr-1">download</span>
              {t.download}
            </button>
          </div>
        </div>
      )}

      {/* Passcode protected alert notification toast */}
      {showToast && (
        <div 
          id="auth-notification" 
          className="fixed bottom-32 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full flex items-center gap-3 animate-bounce shadow-2xl z-[100] border border-primary/20 text-white"
        >
          <span className="material-symbols-outlined text-primary">verified_user</span>
          <span className="font-label-md text-xs font-semibold">{t.passcodeProtected}</span>
        </div>
      )}

      {/* Custom Notification Modal */}
      {notification.isOpen && (
        <div 
          onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-outline-variant/40 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
          >
            {notification.type === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mb-4 text-error">
                <span className="material-symbols-outlined text-4xl">cancel</span>
              </div>
            )}
            {notification.type === 'warning' && (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
            )}
            {notification.type === 'info' && (
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-4xl">info</span>
              </div>
            )}

            <h3 className="font-display-lg text-lg font-bold text-white mb-1">
              {notification.title}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2">
              {notification.message}
            </p>

            <button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-surface-container-highest hover:bg-surface-bright text-white font-semibold py-2.5 rounded-xl border border-outline-variant/30 active:scale-98 transition-all cursor-pointer text-xs"
            >
              {t.notifClose}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
