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
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateImage } from '@/ai/flows/generate-image-flow';

const articleSchema = z.object({
  title: z.string().min(3, { message: 'Judul harus memiliki setidaknya 3 karakter.' }),
  author: z.string().min(3, { message: 'Nama penulis harus memiliki setidaknya 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten harus memiliki setidaknya 10 karakter.' }),
  imageUrl: z.string().url({ message: 'URL gambar tidak valid.' }).optional().or(z.literal('')),
});

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const articleId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      author: '',
      content: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (articleId) {
      const fetchArticle = async () => {
        try {
          if (!db) {
            setLoading(false);
            return;
          }
          const articleDocRef = doc(db, 'articles', articleId);
          const articleDocSnap = await getDoc(articleDocRef);

          if (articleDocSnap.exists()) {
            const articleData = articleDocSnap.data();
            form.reset({
              title: articleData.title,
              author: articleData.author,
              content: articleData.content,
              imageUrl: articleData.imageUrl,
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Artikel tidak ditemukan',
            });
            router.push('/dashboard/articles');
          }
        } catch (error) {
          console.error("Error fetching article: ", error);
          toast({
            variant: 'destructive',
            title: 'Gagal memuat artikel',
            description: 'Terjadi kesalahan saat mengambil data dari server.',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchArticle();
    }
  }, [articleId, form, router, toast]);

  const onSubmit = async (values: z.infer<typeof articleSchema>) => {
    if (!db) return;
    setIsSubmitting(true);
    try {
      const articleDocRef = doc(db, 'articles', articleId);
      await updateDoc(articleDocRef, values);
      toast({
        title: 'Artikel Diperbarui',
        description: 'Perubahan pada artikel Anda telah berhasil disimpan.',
      });
      router.push('/dashboard/articles');
    } catch (error) {
      console.error("Error updating article: ", error);
      setIsSubmitting(false);
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui artikel',
        description: 'Terjadi kesalahan saat menyimpan perubahan.',
      });
    }
  };

  const handleGenerateImage = async () => {
    const title = form.getValues('title');
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Judul Diperlukan',
        description: 'Silakan masukkan judul terlebih dahulu untuk membuat gambar.',
      });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImage(title);
      form.setValue('imageUrl', imageUrl, { shouldValidate: true });
       toast({
        title: 'Gambar Berhasil Dibuat',
        description: 'Gambar baru telah dibuat oleh AI dan ditambahkan ke artikel.',
      });
    } catch (error) {
      console.error("Error generating image: ", error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Gambar',
        description: 'Terjadi kesalahan saat membuat gambar dengan AI.',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const imageUrl = form.watch('imageUrl');
  const hasImageUrl = !!imageUrl;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gambar Artikel</FormLabel>
                       <div className="flex items-center gap-4">
                          <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                            {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {hasImageUrl ? 'Buat Gambar Baru' : 'Buat Gambar AI'}
                          </Button>
                           {isGeneratingImage && <span className="text-sm text-muted-foreground">Membuat gambar... (bisa memakan waktu beberapa detik)</span>}
                        </div>
                      <FormControl>
                        <div className="flex items-center gap-4 mt-2">
                           <Input
                            {...field}
                            value={hasImageUrl ? 'Gambar berhasil dibuat oleh AI. Simpan untuk melihatnya.' : ''}
                            placeholder="Klik tombol di atas untuk membuat gambar"
                            readOnly
                            className="flex-grow bg-slate-100"
                           />
                          {imageUrl && (
                            <Image
                              src={imageUrl}
                              alt="Pratinjau Gambar"
                              width={80}
                              height={80}
                              className="rounded-md object-cover"
                              data-ai-hint="article preview"
                            />
                          )}
                        </div>
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
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/articles')} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !db}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
