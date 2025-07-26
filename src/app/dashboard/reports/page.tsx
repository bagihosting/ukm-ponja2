
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Laporan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laporan</CardTitle>
          <CardDescription>Analisis dan laporan data.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center text-muted-foreground py-8">
              Fitur ini sedang dalam pengembangan.
           </div>
        </CardContent>
      </Card>
    </>
  );
}
