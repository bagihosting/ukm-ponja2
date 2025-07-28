
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { reportLinks } from '@/lib/reports-data';
import { ReportCard } from '@/components/portals/report-card';

export default function PublicReportsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Laporan Publik</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Akses laporan dan dokumen publik dari kegiatan kami untuk transparansi. Klik untuk melihat laporan langsung di dalam situs.
              </p>
            </div>

            <Card className="mt-12 max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Akses Cepat Laporan</CardTitle>
                    <CardDescription>Berikut adalah tautan-tautan penting untuk mengakses laporan dan data UKM.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {reportLinks.map((link) => (
                      <ReportCard key={link.title} report={link} inDashboard={false} />
                    ))}
                  </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
