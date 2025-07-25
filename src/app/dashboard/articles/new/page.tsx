'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const articleSchema = z.object({
  title: z.string().min(3, { message: 'Judul harus memiliki setidaknya 3 karakter.' }),
  author: z.string().min(3, { message: 'Nama penulis harus memiliki setidaknya 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten harus memiliki setidaknya 10 karakter.' }),
});

export default function NewArticlePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      author: '',
      content: '',
    },
  });

  const onSubmit = (values: z.infer<typeof articleSchema>) => {
    console.log(values);
    toast({
      title: 'Artikel Dibuat',
      description: 'Artikel baru Anda telah berhasil disimpan sebagai draf.',
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
              <CardTitle>Buat Artikel Baru</CardTitle>
              <CardDescription>Isi detail di bawah ini untuk membuat artikel baru.</CardDescription>
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
            <Button type="submit">Simpan Draf</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
