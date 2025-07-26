
'use client'

import Link from 'next/link';
import { HeartPulse, Menu } from 'lucide-react';
import { getArticles, type Article } from '@/lib/articles';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import React from 'react';


function PortalNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);

    const navLinks = [
      { href: "/", label: "Home" },
      { href: "/profil", label: "Profil" },
      { href: "/program-ukm", label: "Program UKM" },
      { href: "/galeri", label: "Galeri" },
      { href: "/laporan", label: "Laporan" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                {/* Desktop Menu */}
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
                
                {/* Mobile Menu */}
                <div className="md:hidden">
                     <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Buka Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader>
                               <SheetTitle>
                                 <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                    <HeartPulse className="h-6 w-6 text-primary" />
                                    <span className="font-bold">UKM PONJA</span>
                                </Link>
                               </SheetTitle>
                            </SheetHeader>
                             <nav className="mt-8 grid gap-4">
                                {navLinks.map(({ href, label }) => (
                                    <Link 
                                        key={label} 
                                        href={href} 
                                        className="text-lg font-medium text-foreground/80 hover:text-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
                    <Link href="/login">
                        <Button variant="ghost">Admin Login</Button>
                    </Link>
                </div>

                 {/* Mobile Brand and Login */}
                <div className="flex items-center gap-4 md:hidden">
                    <Link href="/" className="flex items-center space-x-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                         <span className="font-bold sm:inline-block">UKM PONJA</span>
                    </Link>
                     <Link href="/login">
                        <Button variant="ghost" size="sm">Login</Button>
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

function truncate(text: string, length: number) {
    if (!text || text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}

// NOTE: This component is now client-side to support the mobile menu state.
// Data fetching will be done client-side with useEffect.
export default function HomePage() {
  const [galleryImages, setGalleryImages] = React.useState<GalleryImage[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedImages, fetchedArticles] = await Promise.all([
          getGalleryImages(),
          getArticles()
        ]);
        
        const sortedImages = fetchedImages
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
          .slice(0, 5);
        setGalleryImages(sortedImages);

        const sortedArticles = fetchedArticles.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setArticles(sortedArticles);
      } catch (error) {
        console.error("Gagal memuat data portal:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative">
          
          {/* Slider Section */}
          {loading ? <div className="my-8 h-[50vh] bg-muted rounded-lg animate-pulse" /> : galleryImages.length > 0 && (
            <section className="my-8">
                <h2 className="text-3xl font-bold tracking-tight text-center mb-6">Galeri Kegiatan</h2>
                <Carousel 
                    opts={{
                    align: "start",
                    loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                    {galleryImages.map((image) => (
                        <CarouselItem key={image.id}>
                            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden shadow-lg">
                               <img
                                 src={image.url}
                                 alt={image.name}
                                 className="w-full h-full object-cover"
                               />
                            </AspectRatio>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </section>
          )}

          {/* Articles Section */}
          <section id="articles" className="py-12 space-y-8">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Artikel Terbaru</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Baca berita dan pembaruan terkini dari kegiatan kami.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                    <AspectRatio ratio={4/3} className="bg-muted animate-pulse" />
                    <CardHeader><div className="h-6 w-3/4 bg-muted animate-pulse rounded-md" /></CardHeader>
                    <CardContent><div className="h-10 w-full bg-muted animate-pulse rounded-md" /></CardContent>
                    <div className="p-4 pt-0 mt-auto"><div className="h-10 w-full bg-muted animate-pulse rounded-md" /></div>
                </Card>
              )) : articles.length > 0 ? (
                articles.map(article => (
                  <Card key={article.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <AspectRatio ratio={4 / 3} className="bg-muted">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                         <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">Gambar tidak tersedia</div>
                      )}
                    </AspectRatio>
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">{truncate(article.title, 50)}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">
                        {truncate(article.content, 100)}
                      </p>
                    </CardContent>
                    <div className="p-4 pt-0 mt-auto">
                       <Button variant="outline" className="w-full" asChild>
                         <Link href={`/artikel/${article.id}`}>Baca Selengkapnya</Link>
                       </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground py-8">Belum ada artikel yang dipublikasikan.</p>
              )}
            </div>
          </section>
          
          {/* Programs & Reports Section */}
          <div className="grid md:grid-cols-2 gap-8 my-12">
            <section id="programs" className="space-y-6">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Program UKM</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Lihat program dan inisiatif yang sedang kami jalankan.
                </p>
                </div>
                <Card className="shadow-lg">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>Fitur ini sedang dalam pengembangan.</p>
                        <Button asChild variant="link">
                            <Link href="/program-ukm">Lihat Selengkapnya</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>

            <section id="reports" className="space-y-6">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Laporan</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Akses laporan publik dan analisis dari kegiatan kami.
                </p>
                </div>
                <Card className="shadow-lg">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>Fitur ini sedang dalam pengembangan.</p>
                        <Button asChild variant="link">
                            <Link href="/laporan">Lihat Selengkapnya</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
          </div>

        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
