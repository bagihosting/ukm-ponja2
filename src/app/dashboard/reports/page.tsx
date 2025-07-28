
'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportLinks } from '@/lib/reports-data';

export default function DashboardReportsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Laporan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat Laporan</CardTitle>
          <CardDescription>
            Berikut adalah tautan-tautan penting untuk mengakses laporan, spreadsheet, dan data UKM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {reportLinks.map((link) => (
              <Card key={link.title} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-semibold">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <div className="flex w-full sm:w-auto space-x-2">
                  <Button asChild className="flex-1 sm:flex-none">
                    <Link href={`/laporan/${link.slug}`}>
                      Lihat di Sini
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="icon" title="Buka di Tab Baru">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
