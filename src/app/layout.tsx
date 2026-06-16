import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhotoFlow AI - Retouchez, organisez et livrez vos photos",
  description: "La plateforme professionnelle pensée pour les photographes du monde entier. Retouchez avec l'IA, organisez vos projets, et livrez des galeries sécurisées à vos clients avec paiements intégrés (cartes bancaires, Wave, Orange).",
  keywords: ["photographie", "gestion", "retouche photo", "IA", "global", "galerie client", "Wave", "Orange Money", "FCFA", "credit card"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        {/* Load Inter and Plus Jakarta Sans from Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Load Material Symbols Outlined */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md text-on-surface bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
