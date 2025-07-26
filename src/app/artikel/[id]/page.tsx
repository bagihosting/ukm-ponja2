
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
      <main className="flex-1 py-12">
        <div className="container">
            <Button asChild variant="ghost" className="mb-8">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Semua Artikel
                </Link>
            </Button>
            <article>
                {article.imageUrl && (
                    <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden mb-8 shadow-lg">
                        <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                        />
                    </AspectRatio>
                )}

                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                    {article.title}
                </h1>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Calendar className="h-4 w-4" />
                    <span>Diterbitkan pada {formattedDate}</span>
                </div>
                
                <div 
                    className="prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
                />
            </article>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
