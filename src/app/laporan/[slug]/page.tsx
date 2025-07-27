
'use server';

import { notFound } from 'next/navigation';
import { reportLinks } from '@/lib/reports-data';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function ReportViewerPage({ params }: { params: { slug: string } }) {
  const report = reportLinks.find(link => link.slug === params.slug);

  if (!report) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex-1">
                    <Button asChild variant="ghost" className="mb-2 -ml-4">
                        <Link href="/laporan">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar Laporan
                        </Link>
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold">{report.title}</h1>
                    <p className="text-muted-foreground mt-1">{report.description}</p>
                </div>
                <Button asChild>
                    <Link href={report.url} target="_blank" rel="noopener noreferrer">
                         <ExternalLink className="mr-2 h-4 w-4" />
                        Buka di Tab Baru
                    </Link>
                </Button>
            </div>
          
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="aspect-w-16 aspect-h-9 bg-muted">
                         <iframe
                            src={report.embedUrl}
                            className="w-full h-[calc(100vh-250px)] border-0"
                            allow="fullscreen"
                        >
                            Memuat laporan...
                        </iframe>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}

// Generate static paths for all reports
export async function generateStaticParams() {
  return reportLinks.map(report => ({
    slug: report.slug,
  }));
}
