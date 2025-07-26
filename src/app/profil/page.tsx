
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function PortalNavbar() {
    const navLinks = [
      { href: "/", label: "Home" },
      { href: "/profil", label: "Profil" },
      { href: "/program-ukm", label: "Program UKM" },
      { href: "/galeri", label: "Galeri" },
      { href: "/laporan", label: "Laporan" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">UKM PONJA</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navLinks.map(({ href, label }) => (
                            <Link key={label} href={href} className="transition-colors hover:text-foreground/80 text-foreground/60">
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <Link href="/login">
                        <Button variant="ghost">Admin Login</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

function PortalFooter() {
    return (
        <footer className="py-6 md:px-8 md:py-0 bg-secondary text-secondary-foreground mt-12">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Dibangun dengan ❤️ oleh Rani Kirana.
                </p>
                 <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
                    Hak Cipta © {new Date().getFullYear()} UKM PONJA.
                </p>
            </div>
        </footer>
    )
}

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
