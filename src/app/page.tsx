
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { getArticles, type Article } from '@/lib/articles';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from '@/components/ui/button';

async function fetchGalleryImages() {
  try {
    const images = await getGalleryImages();
    // Return only the first 5 images for the slider
    return images.slice(0, 5);
  } catch (error) {
    console.error("Failed to fetch gallery images for portal:", error);
    return []; // Return empty array on error
  }
}

async function fetchArticles() {
  try {
    const articles = await getArticles();
    return articles.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  } catch (error) {
    console.error("Failed to fetch articles for portal:", error);
    return []; // Return empty array on error
  }
}

function PortalNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="flex items-center space-x-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                        <span className="font-bold">UKM PONJA</span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center">
                       <Link href="/login">
                           <Button variant="ghost">Admin Login</Button>
                       </Link>
                    </nav>
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
            </div>
        </footer>
    )
}

function truncate(text: string, length: number) {
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}

export default async function HomePage() {
  const galleryImages = await fetchGalleryImages();
  const articles = await fetchArticles();

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
                        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                           <img
                             src={image.url}
                             alt={image.name}
                             className="w-full h-full object-cover"
                           />
                        </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>
          )}

          {/* Articles Section */}
          <section id="articles" className="space-y-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Artikel Terbaru</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Baca berita dan pembaruan terkini dari kegiatan kami.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {articles.length > 0 ? (
                articles.map(article => (
                  <Card key={article.id} className="flex flex-col">
                    <AspectRatio ratio={4 / 3} className="bg-muted rounded-t-lg overflow-hidden">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                         <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                    </AspectRatio>
                    <CardHeader>
                      <CardTitle>{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">
                        {truncate(article.content, 100)}
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                       <Button variant="outline" className="w-full" asChild>
                         <Link href="#">Baca Selengkapnya</Link>
                       </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground">Belum ada artikel yang dipublikasikan.</p>
              )}
            </div>
          </section>
          
          {/* Programs Section */}
          <section id="programs" className="my-12 space-y-6">
             <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Program UKM</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Lihat program dan inisiatif yang sedang kami jalankan.
              </p>
            </div>
             <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    Fitur ini sedang dalam pengembangan.
                </CardContent>
             </Card>
          </section>

          {/* Reports Section */}
           <section id="reports" className="my-12 space-y-6">
             <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Laporan</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Akses laporan publik dan analisis dari kegiatan kami.
              </p>
            </div>
             <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    Fitur ini sedang dalam pengembangan.
                </CardContent>
             </Card>
          </section>

        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
