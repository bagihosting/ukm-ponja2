
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { getArticles, deleteArticle, type Article } from '@/lib/articles';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const fetchedArticles = await getArticles();
        setArticles(fetchedArticles);
      } catch (err: any) {
        setError('Gagal memuat artikel: ' + err.message);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat artikel.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [toast]);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await deleteArticle(articleToDelete.id);
      setArticles(articles.filter((article) => article.id !== articleToDelete.id));
      toast({
        title: 'Berhasil',
        description: 'Artikel telah berhasil dihapus.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: 'Terjadi kesalahan saat menghapus artikel: ' + err.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Artikel</h1>
        <Link href="/dashboard/articles/new">
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tambah Artikel</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Artikel</CardTitle>
          <CardDescription>Kelola artikel yang ada di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Gambar</span>
                  </TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>
                    <span className="sr-only">Tindakan</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length > 0 ? articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="hidden sm:table-cell">
                      {article.imageUrl ? (
                        <img alt={article.title} className="aspect-square rounded-md object-cover" height="64" src={article.imageUrl} width="64" />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.createdAt ? new Date(article.createdAt.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/articles/edit/${article.id}`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(article)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Belum ada artikel.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus artikel secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
