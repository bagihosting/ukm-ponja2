
'use server';

import Link from 'next/link';
import { getArticles, type Article } from '@/lib/articles';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Newspaper } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const ARTICLES_PER_PAGE = 15;

interface ArticlesPageProps {
  searchParams?: {
    page?: string;
  };
}

function ArticleCard({ article }: { article: Article }) {
    return (
        <Card className="group flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <Link href={`/artikel/${article.id}`} aria-label={`Baca artikel: ${article.title}`} className="block overflow-hidden">
              <AspectRatio ratio={16 / 9} className="bg-muted">
                  <img
                  src={article.imageUrl || `https://placehold.co/400x225.png`}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="news article"
                  />
              </AspectRatio>
          </Link>
          <CardHeader className="flex-grow p-4">
            <CardTitle className="text-lg font-semibold leading-tight mb-2">
              <Link href={`/artikel/${article.id}`} className="hover:text-primary transition-colors">
                  {article.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">
              {article.createdAt ? new Date(article.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric', month: 'long', day: 'numeric'
              }) : 'Tanggal tidak tersedia'}
            </CardDescription>
          </CardHeader>
      </Card>
    );
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const { articles, total } = await getArticles({ page: currentPage, limit: ARTICLES_PER_PAGE });
  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);

  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <Newspaper className="h-16 w-16 text-primary" />
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Semua Artikel</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Jelajahi semua berita, pengumuman, dan informasi kesehatan terbaru dari kami.
              </p>
            </div>

            <div className="mt-12">
                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground border rounded-lg bg-muted/50">
                    <p>Belum ada artikel yang dipublikasikan.</p>
                  </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-12">
                    <Pagination totalPages={totalPages} />
                </div>
            )}
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
