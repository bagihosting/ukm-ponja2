
'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const reportLinks = [
  {
    title: "Laporan ke Dinas",
    url: "https://docs.google.com/spreadsheets/d/1A-_JO_9bN-_RSh1Ubr8Ux5-x4UxwN_zuYyeN4xM3gwY/edit?gid=1299877445#gid=1299877445",
    description: "Spreadsheet berisi data laporan yang dikirimkan ke dinas kesehatan terkait."
  },
  {
    title: "Laporan Grafik",
    url: "https://docs.google.com/spreadsheets/d/17WWQvrkT5Nazx4-7eZQ566K-KfQt_PRmCJN1Zfi9xNw/edit?gid=661340878#gid=661340878",
    description: "Visualisasi data dan grafik untuk memantau performa program UKM."
  },
  {
    title: "Log Book UKM",
    url: "https://docs.google.com/spreadsheets/d/17pzuT9gDLAXhwGQibsTYEzUvttzdg6qvZA8qVYbKh8w/edit?gid=377502369#gid=377502369",
    description: "Buku catatan digital untuk semua aktivitas dan kegiatan UKM."
  },
  {
    title: "Google Drive Data UKM",
    url: "https://drive.google.com/drive/folders/12B0BJUMSfYS1pPRYunz5xI4xPC0KGUxa",
    description: "Folder pusat untuk menyimpan semua file, dokumen, dan data terkait UKM."
  }
];

export default function PublicReportsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Laporan Publik</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Akses laporan dan dokumen publik dari kegiatan kami untuk transparansi.
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
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Buka Laporan
                          </Link>
                        </Button>
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
