
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, Calendar, ArrowLeft } from 'lucide-react';
import { getArticle } from '@/lib/articles';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

async function fetchArticle(id: string) {
    try {
        const article = await getArticle(id);
        return article;
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        return null;
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

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const article = await fetchArticle(params.id);

  if (!article) {
    notFound();
  }
  
  const formattedDate = article.createdAt 
    ? new Date(article.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
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
