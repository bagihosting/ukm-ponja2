
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reportLinks } from '@/lib/reports-data';
import { ReportCard } from '@/components/portals/report-card';

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
            Klik untuk melihat laporan langsung di dasbor ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {reportLinks.map((link) => (
              <ReportCard key={link.title} report={link} inDashboard={true} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
