
'use server'

import Link from 'next/link';
import { getArticles } from '@/lib/articles';
import { getPrograms } from '@/lib/programs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from '@/components/ui/button';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AiDoctor } from '@/components/portals/ai-doctor';


function truncate(text: string, length: number) {
    if (!text || text.length <= length) {
        return text;
    }
    const cut = text.indexOf(' ', length);
    if (cut === -1) return text;
    return text.substring(0, cut) + '...';
}

async function fetchData() {
  try {
    const [fetchedArticles, fetchedPrograms] = await Promise.all([
      getArticles(),
      getPrograms()
    ]);
    
    const sortedArticles = fetchedArticles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { articles: sortedArticles, programs: fetchedPrograms };
  } catch (error) {
    console.error("Gagal memuat data portal:", error);
    return { articles: [], programs: [] };
  }
}

export default async function HomePage() {
  const { articles, programs } = await fetchData();

  const headlineArticle = articles.length > 0 ? articles[0] : null;
  const popularArticles = articles.length > 1 ? articles.slice(1, 6) : [];
  const otherArticles = articles.length > 6 ? articles.slice(6, 12) : [];
  
  const essentialPrograms = programs.filter(p => p.category === 'UKM Esensial').slice(0, 5);
  const developmentPrograms = programs.filter(p => p.category === 'UKM Pengembangan').slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PortalNavbar />
      <main className="flex-1 container mx-auto">
        
        <section id="headline-section" className="py-8 md:py-12" aria-labelledby="headline-heading">
          {articles.length > 0 && headlineArticle ? (
              <div className="flex flex-col lg:flex-row gap-8">
                  {/* Headline Article */}
                  <div className="lg:w-2/3 flex">
                      <Link href={`/artikel/${headlineArticle.id}`} className="group block h-full w-full">
                          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                              <AspectRatio ratio={16 / 9} className="bg-muted">
                                  <img
                                      src={headlineArticle.imageUrl || 'https://placehold.co/800x450.png'}
                                      alt={headlineArticle.title}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      data-ai-hint="headline news"
                                  />
                              </AspectRatio>
                              <CardContent className="p-6 flex-grow flex flex-col">
                                  <h2 id="headline-heading" className="text-2xl md:text-3xl font-extrabold leading-tight group-hover:text-primary transition-colors mb-2">
                                      {headlineArticle.title}
                                  </h2>
                                  <p className="text-base text-muted-foreground">
                                      {truncate(headlineArticle.content, 150)}
                                  </p>
                              </CardContent>
                          </Card>
                      </Link>
                  </div>
                  
                  {/* Popular Articles */}
                  {popularArticles.length > 0 && (
                      <div className="lg:w-1/3 flex flex-col">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 border-b pb-2">
                              Berita Populer
                          </h2>
                          <div className="space-y-4 flex-grow flex flex-col">
                              {popularArticles.map((article, index) => (
                                  <Link key={article.id} href={`/artikel/${article.id}`} className="group block">
                                      <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted transition-colors">
                                          <div className="text-4xl font-bold text-muted-foreground/50 w-8 text-center flex-shrink-0">
                                              {index + 1}
                                          </div>
                                          <h4 className="flex-1 font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                              {article.title}
                                          </h4>
                                      </div>
                                  </Link>
                              ))}
                              <div className="mt-auto pt-4">
                                    <Button asChild variant="outline" className="w-full">
                                      <Link href="/#articles">
                                          Lihat Semua Artikel <ArrowRight className="ml-2 h-4 w-4" />
                                      </Link>
                                  </Button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    <p className="font-semibold text-lg">Belum ada berita</p>
                    <p>Saat ini belum ada artikel yang dipublikasikan. Silakan kembali lagi nanti.</p>
                </CardContent>
              </Card>
            )}
        </section>

        {/* AI Doctor Section */}
        <section id="ai-doctor" className="py-8 md:py-12" aria-label="Konsultasi dengan AI Dokter">
           <div className="mx-auto max-w-4xl">
              <AiDoctor />
           </div>
        </section>

        {/* More Articles Section */}
        {otherArticles.length > 0 && (
            <section id="articles" className="py-8 md:py-12 space-y-8" aria-labelledby="articles-heading">
              <div className="text-center max-w-4xl mx-auto">
                  <h2 id="articles-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Berita Terbaru</h2>
                  <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Jelajahi lebih banyak informasi dan berita kesehatan dari kami.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map(article => (
                    <Card key={article.id} className="group flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <Link href={`/artikel/${article.id}`} aria-label={`Baca artikel: ${article.title}`} className="block overflow-hidden">
                          <AspectRatio ratio={16 / 9} className="bg-muted">
                              <img
                              src={article.imageUrl || 'https://placehold.co/400x225.png'}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint="health news"
                              />
                          </AspectRatio>
                      </Link>
                      <CardHeader className="flex-grow p-4">
                        <h3 className="text-lg font-semibold leading-tight mb-2">
                          <Link href={`/artikel/${article.id}`} className="hover:underline hover:text-primary transition-colors">
                              {truncate(article.title, 80)}
                          </Link>
                        </h3>
                          <p className="text-xs text-muted-foreground">
                          {new Date(article.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </CardHeader>
                  </Card>
                ))}
              </div>
          </section>
        )}

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

      </main>
      <PortalFooter />
    </div>
  );
}
