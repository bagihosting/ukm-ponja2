
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, Link as LinkIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getArticle, updateArticle } from '@/lib/articles';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';

const articleSchema = z.object({
  title: z.string().min(1, { message: 'Judul tidak boleh kosong.' }),
  content: z.string().min(1, { message: 'Konten tidak boleh kosong.' }),
  imageUrl: z.string().url({ message: 'URL gambar tidak valid.' }).or(z.literal('')),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const newUrl = new URL(url);
    return (newUrl.protocol === 'http:' || newUrl.protocol === 'https:') && newUrl.hostname.includes('.');
  } catch (e) {
    return false;
  }
};

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
  });

  const imageUrl = watch('imageUrl');

  const fetchArticle = useCallback(async (articleId: string) => {
    setPageLoading(true);
    try {
      const fetchedArticle = await getArticle(articleId);
      if (fetchedArticle) {
        reset({
          title: fetchedArticle.title,
          content: fetchedArticle.content,
          imageUrl: fetchedArticle.imageUrl || '',
        });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Artikel tidak ditemukan.' });
        router.push('/dashboard/articles');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat artikel.' });
    } finally {
      setPageLoading(false);
    }
  }, [reset, router, toast]);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchArticle(id);
    }
  }, [id, fetchArticle]);

  const onSubmit = async (data: ArticleFormValues) => {
    if (typeof id !== 'string') return;
    setLoading(true);
    try {
      await updateArticle(id, {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      });
      toast({
        title: 'Berhasil!',
        description: 'Artikel telah berhasil diperbarui.',
      });
      router.push('/dashboard/articles');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt) {
      toast({ variant: 'destructive', title: 'Prompt Kosong', description: 'Silakan masukkan deskripsi gambar.' });
      return;
    }
    setIsGenerating(true);
    try {
      const input: GenerateImageInput = { prompt: aiPrompt };
      const result = await generateImage(input);
      if (result.imageUrl) {
        setValue('imageUrl', result.imageUrl, { shouldValidate: true });
        toast({ title: 'Berhasil!', description: 'Gambar berhasil dibuat dan URL ditambahkan.' });
        setIsAiModalOpen(false);
        setAiPrompt('');
      } else {
        throw new Error('AI tidak mengembalikan URL gambar.');
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Gagal Membuat Gambar', description: `Terjadi kesalahan: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (pageLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-4 mb-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit Artikel
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/articles')}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Detail Artikel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      type="text"
                      className="w-full"
                      {...register('title')}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Konten</Label>
                    <Textarea
                      id="content"
                      className="min-h-32"
                      {...register('content')}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Gambar Artikel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="imageUrl">URL Gambar</Label>
                     <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="imageUrl"
                        type="url"
                        className="w-full pl-10"
                        placeholder="https://..."
                        {...register('imageUrl')}
                      />
                    </div>
                    {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                  </div>

                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAiModalOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Buat dengan AI
                  </Button>

                  {imageUrl && isValidUrl(imageUrl) && (
                    <div className="aspect-video relative">
                      <Image
                        src={imageUrl}
                        alt="Pratinjau Gambar"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/articles')}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>

      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Gambar dengan AI</DialogTitle>
            <DialogDescription>
              Masukkan deskripsi (prompt) untuk gambar yang ingin Anda buat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Deskripsi Gambar</Label>
              <Textarea
                id="ai-prompt"
                placeholder='Contoh: "Astronot menunggang kuda di luar angkasa"'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isGenerating}>Batal</Button>
            </DialogClose>
            <Button type="button" onClick={handleGenerateImage} disabled={isGenerating || !aiPrompt}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Gambar
            </Button>
          </