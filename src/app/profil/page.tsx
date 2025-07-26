
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';


export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Profil UKM PONJA</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Mengenal lebih dekat dengan Unit Kegiatan Mahasiswa Pondok Lanjut Usia (UKM PONJA).
              </p>
            </div>

            <Card className="mt-12">
                <CardHeader>
                    <CardTitle>Tentang Kami</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        Konten untuk profil UKM akan ditampilkan di sini. Anda dapat mengedit halaman ini di `src/app/profil/page.tsx` untuk menambahkan informasi tentang visi, misi, sejarah, dan struktur organisasi UKM Anda.
                    </p>
                    <p>
                        Ini adalah halaman statis, artinya kontennya langsung ditulis di dalam kode. Untuk konten yang lebih dinamis, Anda bisa membuat fitur "Profil" di dasbor admin dan mengambil datanya dari Firestore, mirip seperti cara kerja halaman Artikel dan Galeri.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
