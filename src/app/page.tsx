
'use server'

import Link from 'next/link';
import { getArticles, type Article } from '@/lib/articles';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from '@/components/ui/button';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';

function truncate(text: string, length: number) {
    if (!text || text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}

async function fetchData() {
  try {
    const [fetchedImages, fetchedArticles] = await Promise.all([
      getGalleryImages(),
      getArticles()
    ]);
    
    const sortedImages = fetchedImages
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 5);

    const sortedArticles = fetchedArticles.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    
    return { galleryImages: sortedImages, articles: sortedArticles };
  } catch (error) {
    console.error("Gagal memuat data portal:", error);
    return { galleryImages: [], articles: [] };
  }
}

export default async function HomePage() {
  const { galleryImages, articles } = await fetchData();

  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative">
          
          {/* Slider Section */}
          {galleryImages.length > 0 && (
            <section className="my-8">
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

          {/* Intro Section */}
          <section className="py-12 text-center">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">Selamat Datang di UKM PONJA</h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Upaya Kesehatan Masyarakat (UKM) adalah setiap kegiatan untuk memelihara dan meningkatkan kesehatan serta mencegah dan menanggulangi timbulnya masalah kesehatan dengan sasaran keluarga, kelompok, dan masyarakat.
                </p>
            </div>
          </section>


          {/* Articles Section */}
          <section id="articles" className="py-12 space-y-8">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Artikel Terbaru</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Baca berita dan pembaruan terkini dari kegiatan kami.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.length > 0 ? (
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
