
'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReportLink {
  slug: string;
  title: string;
  url: string;
  embedUrl: string;
  description: string;
}

interface ReportCardProps {
  report: ReportLink;
  inDashboard?: boolean;
}

export function ReportCard({ report, inDashboard = false }: ReportCardProps) {
  const internalLink = inDashboard ? `/dashboard/reports/${report.slug}` : `/laporan/${report.slug}`;
  
  return (
    <Card key={report.title} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
      <div className="mb-4 sm:mb-0">
        <h3 className="font-semibold">{report.title}</h3>
        <p className="text-sm text-muted-foreground">{report.description}</p>
      </div>
      <div className="flex w-full sm:w-auto space-x-2">
        <Button asChild className="flex-1 sm:flex-none">
          <Link href={internalLink}>
            Lihat di Sini
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" title="Buka di Tab Baru">
          <Link href={report.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
