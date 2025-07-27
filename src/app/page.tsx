
'use server'

import Link from 'next/link';
import { getArticles, type Article } from '@/lib/articles';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { getPrograms, type Program } from '@/lib/programs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from '@/components/ui/button';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AiDoctor } from '@/components/portals/ai-doctor';


function truncate(text: string, length: number) {
    if (!text || text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}

async function fetchData() {
  try {
    const [fetchedImages, fetchedArticles, fetchedPrograms] = await Promise.all([
      getGalleryImages(),
      getArticles(),
      getPrograms()
    ]);
    
    const sortedImages = fetchedImages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const sortedArticles = fetchedArticles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { galleryImages: sortedImages, articles: sortedArticles, programs: fetchedPrograms };
  } catch (error) {
    console.error("Gagal memuat data portal:", error);
    return { galleryImages: [], articles: [], programs: [] };
  }
}

export default async function HomePage() {
  const { galleryImages, articles, programs } = await fetchData();

  const headlineArticle = articles.length > 0 ? articles[0] : null;
  const trendingArticles = articles.length > 1 ? articles.slice(1, 5) : [];
  const healthArticles = articles.length > 5 ? articles.slice(5) : [];

  const essentialPrograms = programs.filter(p => p.category === 'UKM Esensial').slice(0, 5);
  const developmentPrograms = programs.filter(p => p.category === 'UKM Pengembangan').slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container px-4 md:px-6 space-y-16 md:space-y-24">
          
          {/* Slider Section */}
          {galleryImages.length > 0 && (
            <section className="pt-8 md:pt-12" aria-label="Galeri Kegiatan Terbaru">
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
                                 alt={image.name || 'Gambar dari galeri kegiatan'}
                                 className="w-full h-full object-cover"
                               />
                            </AspectRatio>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex left-[-50px]" />
                    <CarouselNext className="hidden sm:flex right-[-50px]" />
                </Carousel>
            </section>
          )}

          {/* Intro Section */}
          <section className="py-8 md:py-12 text-center" aria-labelledby="intro-heading">
            <div className="mx-auto max-w-4xl">
                <h1 id="intro-heading" className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">Selamat Datang di UKM PONJA</h1>
                <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                    Upaya Kesehatan Masyarakat (UKM) adalah setiap kegiatan untuk memelihara dan meningkatkan kesehatan serta mencegah dan menanggulangi timbulnya masalah kesehatan dengan sasaran keluarga, kelompok, dan masyarakat.
                </p>
            </div>
          </section>

          {/* AI Doctor Section */}
          <section id="ai-doctor" className="py-8 md:py-12 max-w-4xl mx-auto" aria-label="Konsultasi dengan AI Dokter">
            <AiDoctor />
          </section>

          {/* Articles Section */}
          <section id="articles" className="py-8 md:py-12 space-y-12" aria-labelledby="articles-heading">
             <div className="text-center max-w-4xl mx-auto">
                 <h2 id="articles-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Artikel & Berita Kesehatan</h2>
                 <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Ikuti berita terbaru dan dapatkan informasi kesehatan terpercaya dari kami.</p>
            </div>
            
            {/* Headline News */}
            {headlineArticle && (
              <div>
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="grid md:grid-cols-2">
                    <div className="order-last md:order-first flex flex-col justify-center p-6 lg:p-8">
                      <CardHeader className="p-0 mb-4">
                         <Badge variant="secondary" className="w-fit mb-2">Artikel Terbaru</Badge>
                        <CardTitle className="text-2xl font-bold leading-tight md:text-3xl">{headlineArticle.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                         <p className="text-sm text-muted-foreground leading-relaxed md:text-base">
                          {truncate(headlineArticle.content, 180)}
                        </p>
                      </CardContent>
                      <CardFooter className="p-0 mt-6">
                        <Button asChild>
                          <Link href={`/artikel/${headlineArticle.id}`}>
                            Baca Selengkapnya <ArrowRight className="ml-2 h-4 w-4"/>
                          </Link>
                        </Button>
                      </CardFooter>
                    </div>
                     <AspectRatio ratio={4/3} className="md:ratio-auto">
                       <img
                          src={headlineArticle.imageUrl || 'https://placehold.co/600x400.png'}
                          alt={headlineArticle.title}
                          className="w-full h-full object-cover"
                          data-ai-hint="news article"
                        />
                    </AspectRatio>
                  </div>
                </Card>
              </div>
            )}

            {/* Trending News */}
            {trendingArticles.length > 0 && (
              <div className="space-y-8">
                <h3 className="text-2xl md:text-3xl font-bold text-center">Berita Trending</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingArticles.map(article => (
                     <Card key={article.id} className="group flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <Link href={`/artikel/${article.id}`} aria-label={`Baca artikel: ${article.title}`} className="block overflow-hidden">
                            <AspectRatio ratio={16 / 9} className="bg-muted">
                                <img
                                src={article.imageUrl || 'https://placehold.co/400x225.png'}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="news placeholder"
                                />
                            </AspectRatio>
                        </Link>
                        <CardHeader className="flex-grow p-4">
                          <h4 className="text-md font-semibold leading-tight mb-2 sm:text-lg">
                            <Link href={`/artikel/${article.id}`} className="hover:underline">
                                {truncate(article.title, 60)}
                            </Link>
                          </h4>
                           <p className="text-xs text-muted-foreground">
                            {new Date(article.createdAt).toLocaleDateString('id-ID', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {articles.length === 0 && (
                 <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <p>Belum ada artikel yang dipublikasikan.</p>
                    </CardContent>
                </Card>
            )}

          </section>
          
          {/* Programs & Reports Section */}
          <section id="programs-reports" className="py-8 md:py-12" aria-labelledby="programs-reports-title">
             <div className="text-center max-w-4xl mx-auto">
                 <h2 id="programs-reports-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Program & Laporan</h2>
                 <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Jelajahi inisiatif dan akses laporan publik dari kegiatan kami.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 mt-12">
                <div id="programs" className="space-y-6">
                    {programs.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Card className="shadow-lg h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>UKM Esensial</CardTitle>
                            <CardDescription>Program inti untuk kesehatan masyarakat.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 flex-grow">
                            {essentialPrograms.length > 0 ? essentialPrograms.map(program => (
                            <div key={program.id} className="flex items-start gap-3">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{program.name}</span>
                            </div>
                            )) : (
                            <p className="text-sm text-muted-foreground">Belum ada program.</p>
                            )}
                        </CardContent>
                        </Card>
                        <Card className="shadow-lg h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>UKM Pengembangan</CardTitle>
                            <CardDescription>Inisiatif inovatif untuk kebutuhan spesifik.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 flex-grow">
                            {developmentPrograms.length > 0 ? developmentPrograms.map(program => (
                            <div key={program.id} className="flex items-start gap-3">
                                <CheckCircle2 className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{program.name}</span>
                            </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">Belum ada program.</p>
                            )}
                        </CardContent>
                        </Card>
                    </div>
                    ) : (
                    <Card className="shadow-lg">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p>Belum ada program yang ditambahkan.</p>
                        </CardContent>
                    </Card>
                    )}
                    <div className="text-center pt-4">
                    <Button asChild>
                        <Link href="/program-ukm">Lihat Semua Program <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    </div>
                </div>

                <div id="reports" className="flex">
                    <Card className="shadow-lg w-full flex flex-col justify-between">
                         <CardHeader>
                             <CardTitle>Laporan Publik</CardTitle>
                             <CardDescription>Akses laporan dan dokumen publik dari kegiatan kami.</CardDescription>
                         </CardHeader>
                        <CardContent className="text-center text-muted-foreground flex-grow flex flex-col items-center justify-center">
                            <p className="font-medium">Fitur ini sedang dalam pengembangan.</p>
                        </CardContent>
                         <CardFooter className="justify-center">
                            <Button asChild variant="secondary">
                                <Link href="/laporan">Lihat Halaman Laporan</Link>
                            </Button>
                         </CardFooter>
                    </Card>
                </div>
            </div>
          </section>

        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
