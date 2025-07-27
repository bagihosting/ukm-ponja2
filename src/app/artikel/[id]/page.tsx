
'use server';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { getArticle } from '@/lib/articles';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';

async function fetchArticle(id: string) {
    try {
        const article = await getArticle(id);
        return article;
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        return null;
    }
}

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const article = await fetchArticle(params.id);

  if (!article) {
    notFound();
  }
  
  const formattedDate = article.createdAt 
    ? new Date(article.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Tanggal tidak tersedia';


  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl">
            <Button asChild variant="ghost" className="mb-6 md:mb-8">
                <Link href="/#articles">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Semua Artikel
                </Link>
            </Button>
            <article>
                {article.imageUrl && (
                    <div className="mb-6 md:mb-8 overflow-hidden rounded-lg shadow-lg">
                        <AspectRatio ratio={16/9} className="bg-muted">
                            <img 
                                src={article.imageUrl} 
                                alt={article.title} 
                                className="w-full h-full object-cover"
                            />
                        </AspectRatio>
                    </div>
                )}

                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl mb-4">
                    {article.title}
                </h1>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 md:mb-8">
                    <Calendar className="h-4 w-4" />
                    <span>Diterbitkan pada {formattedDate}</span>
                </div>
                
                <div className="prose prose-lg max-w-none dark:prose-invert">
                    {article.content ? (
                        <p className="whitespace-pre-wrap">{article.content}</p>
                    ) : (
                        <p className="text-muted-foreground">Konten untuk artikel ini belum tersedia.</p>
                    )}
                </div>
            </article>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
