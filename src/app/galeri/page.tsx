
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio"

async function fetchGalleryImages() {
  try {
    const images = await getGalleryImages();
    return images.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  } catch (error) {
    console.error("Gagal memuat gambar galeri:", error);
    return []; // Return empty array on error
  }
}

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
                    Dibangun dengan ❤️ oleh Tim UKM PONJA.
                </p>
                 <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
                    Hak Cipta © {new Date().getFullYear()} UKM PONJA.
                </p>
            </div>
        </footer>
    )
}

export default async function GalleryPage() {
  const images = await fetchGalleryImages();

  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Galeri Kegiatan</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Dokumentasi visual dari berbagai acara dan kegiatan yang telah kami selenggarakan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                {images.length > 0 ? (
                    images.map(image => (
                        <Card key={image.id} className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <AspectRatio ratio={1} className="bg-muted">
                                <img
                                    src={image.url}
                                    alt={image.name}
                                    className="w-full h-full object-cover"
                                />
                            </AspectRatio>
                        </Card>
                    ))
                ) : (
                     <p className="col-span-full text-center text-muted-foreground py-16">
                        Belum ada gambar di galeri.
                    </p>
                )}
            </div>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
