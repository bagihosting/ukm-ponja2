
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { getSEOSettings } from '@/lib/seo';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Function to generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSEOSettings();

  // Default values if no settings are found
  const defaultTitle = 'UKM PONJA';
  const defaultDescription = 'Website Resmi Upaya Kesehatan Masyarakat Puskesmas Pondok Jagung.';

  return {
    title: seoSettings?.title || defaultTitle,
    description: seoSettings?.description || defaultDescription,
    keywords: seoSettings?.keywords ? seoSettings.keywords.split(',').map(k => k.trim()) : ['kesehatan', 'puskesmas', 'pondo jagung', 'ukm'],
    authors: [{ name: 'Rani Kirana' }],
    creator: 'Rani Kirana',
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`} suppressHydrationWarning>
      <head />
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
            {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
