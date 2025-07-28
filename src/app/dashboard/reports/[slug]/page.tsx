
'use server';

import { notFound } from 'next/navigation';
import { reportLinks } from '@/lib/reports-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default async function ReportViewerPage({ params }: { params: { slug: string } }) {
  const report = reportLinks.find(link => link.slug === params.slug);

  if (!report) {
    notFound();
  }

  // If there's no embedUrl, show a fallback page instead of a broken iframe.
  if (!report.embedUrl) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/40 p-4 text-center">
            <h1 className="text-xl font-semibold">Laporan Tidak Dapat Ditampilkan</h1>
            <p className="text-muted-foreground mt-2 mb-4">Konten ini (contoh: folder Google Drive) tidak dapat ditampilkan langsung di sini.</p>
             <Button asChild>
                <Link href={report.url} target="_blank" rel="noopener noreferrer">
                     <ExternalLink className="mr-2 h-4 w-4" />
                    Buka di Tab Baru
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-muted/40">
      {/* Local Header for Fullscreen View */}
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
           <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/reports">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>
            <div className="hidden md:block border-l h-6 mx-4"></div>
            <h1 className="text-lg font-semibold truncate hidden md:block">{report.title}</h1>
        </div>
        <Button asChild size="sm">
            <Link href={report.url} target="_blank" rel="noopener noreferrer">
                 <ExternalLink className="mr-2 h-4 w-4" />
                Buka di Tab Baru
            </Link>
        </Button>
      </header>

      {/* Responsive Iframe Container */}
      <main className="flex-1 overflow-hidden">
        <iframe
            src={report.embedUrl}
            className="h-full w-full border-0"
            allow="fullscreen"
            title={report.title}
        >
            Memuat laporan atau grafik...
        </iframe>
      </main>
    </div>
  );
}

// Generate static paths for all reports
export async function generateStaticParams() {
  return reportLinks.map(report => ({
    slug: report.slug,
  }));
}
