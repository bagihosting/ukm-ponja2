'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { collection, getDocs, deleteDoc, doc, Timestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

type Article = {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  createdAt: Date;
  status: 'published' | 'draft';
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(db, 'articles');
        const q = query(articlesCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const articlesList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            imageUrl: data.imageUrl,
            author: data.author,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            status: data.status,
          };
        });
        setArticles(articlesList);
      } catch (error) {
        console.error("Error fetching articles: ", error);
        toast({
          variant: 'destructive',
          title: 'Gagal memuat artikel',
          description: 'Terjadi kesalahan saat mengambil data dari server.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'articles', id));
      setArticles(articles.filter(article => article.id !== id));
      toast({
        title: 'Artikel Dihapus',
        description: 'Artikel telah berhasil dihapus.',
      });
    } catch (error) {
      console.error("Error deleting article: ", error);
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus artikel',
        description: 'Terjadi kesalahan saat menghapus data.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Manajemen Artikel</h1>
        <Button asChild>
          <Link href="/dashboard/articles/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Artikel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Artikel</CardTitle>
          <CardDescription>Lihat, kelola, dan publikasikan artikel Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead className="hidden md:table-cell">Penulis</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : articles.length > 0 ? (
                  articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="hidden md:table-cell">
                        <Image
                          alt="Article image"
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={article.imageUrl || 'https://placehold.co/100x100.png'}
                          width="64"
                          data-ai-hint="child health"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{article.author}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(article.createdAt, 'dd MMMM yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                          {article.status === 'published' ? 'Diterbitkan' : 'Draf'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/articles/edit/${article.id}`)}>Edit</DropdownMenuItem>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Hapus</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini tidak dapat dibatalkan. Ini akan menghapus artikel secara permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Belum ada artikel.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
