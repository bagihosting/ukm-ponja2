
'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportLinks } from '@/lib/reports-data';

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
      </main>
      <PortalFooter />
    </div>
  );
}
