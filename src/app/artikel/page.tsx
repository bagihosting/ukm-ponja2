
'use server';

import Link from 'next/link';
import { getArticles, type Article } from '@/lib/articles';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Newspaper } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

const ARTICLES_PER_PAGE = 15;

interface ArticlesPageProps {
  searchParams?: {
    page?: string;
  };
}

function ArticleRow({ article }: { article: Article }) {
    return (
        <TableRow>
            <TableCell className="hidden sm:table-cell">
                 <AspectRatio ratio={16/9} className="w-[120px] bg-muted rounded-md">
                    <Link href={`/artikel/${article.id}`}>
                        <img
                            src={article.imageUrl || `https://placehold.co/400x225.png`}
                            alt={article.title}
                            className="h-full w-full object-cover rounded-md"
                            data-ai-hint="news article"
                        />
                    </Link>
                 </AspectRatio>
            </TableCell>
            <TableCell>
                <Link href={`/artikel/${article.id}`} className="font-semibold text-base hover:text-primary transition-colors">
                    {article.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia'}
                </p>
            </TableCell>
        </TableRow>
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

            <Card className="mt-12">
              <CardContent className="p-0">
                {articles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px] hidden sm:table-cell">Gambar</TableHead>
                        <TableHead>Judul & Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map(article => (
                        <ArticleRow key={article.id} article={article} />
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>Belum ada artikel yang dipublikasikan.</p>
                  </div>
                )}
              </CardContent>
              {totalPages > 1 && (
                <CardFooter className="py-4">
                  <Pagination totalPages={totalPages} />
                </CardFooter>
              )}
            </Card>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
