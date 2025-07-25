'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const articleSchema = z.object({
  title: z.string().min(3, { message: 'Judul harus memiliki setidaknya 3 karakter.' }),
  author: z.string().min(3, { message: 'Nama penulis harus memiliki setidaknya 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten harus memiliki setidaknya 10 karakter.' }),
});

// Mock data fetching
const getArticleById = (id: string) => {
    const articles = [
      { id: '1', title: 'Pentingnya Gizi Seimbang untuk Anak', author: 'Dr. Tirta', content: 'Konten artikel tentang gizi...', status: 'published' },
      { id: '2', title: 'Cara Mencegah Stunting pada Balita', author: 'Dr. Rahman', content: 'Konten artikel tentang stunting...', status: 'published' },
      { id: '3', title: 'Jadwal Imunisasi Wajib untuk Bayi', author: 'Puskesmas Ponja', content: 'Konten artikel tentang imunisasi...', status: 'draft' },
    ];
    return articles.find(article => article.id === id);
};


export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const articleId = params.id as string;

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      author: '',
      content: '',
    },
  });

  useEffect(() => {
    if (articleId) {
      const article = getArticleById(articleId);
      if (article) {
        form.reset(article);
      } else {
        toast({
          variant: 'destructive',
          title: 'Artikel tidak ditemukan',
        });
        router.push('/dashboard/articles');
      }
    }
  }, [articleId, form, router, toast]);

  const onSubmit = (values: z.infer<typeof articleSchema>) => {
    console.log(values);
    toast({
      title: 'Artikel Diperbarui',
      description: 'Perubahan pada artikel Anda telah berhasil disimpan.',
    });
    router.push('/dashboard/articles');
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
         <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Artikel
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Artikel</CardTitle>
              <CardDescription>Perbarui detail artikel di bawah ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Artikel</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Pentingnya Imunisasi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Penulis</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Dr. Tirta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konten Artikel</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tulis konten artikel Anda di sini..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/articles')}>
              Batal
            </Button>
            <Button type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
