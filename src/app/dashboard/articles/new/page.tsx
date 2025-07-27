
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, Link as LinkIcon, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addArticle, getArticle, updateArticle } from '@/lib/articles';
import { AiImageDialog } from '@/components/portals/ai-image-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePreview } from '@/components/portals/image-preview';

const articleSchema = z.object({
  title: z.string().min(1, { message: 'Judul tidak boleh kosong.' }),
  content: z.string().min(1, { message: 'Konten tidak boleh kosong.' }),
  imageUrl: z.string().url({ message: "URL tidak valid" }).or(z.literal("")),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function NewArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const isEditMode = Boolean(articleId);

  const { toast } = useToast();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
        title: '',
        content: '',
        imageUrl: '',
    }
  });

  const imageUrl = watch('imageUrl');

  const fetchArticle = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const article = await getArticle(id);
      if (article) {
        reset(article);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Artikel tidak ditemukan.' });
        setNotFound(true);
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Gagal Memuat', description: 'Gagal memuat data artikel.' });
       setNotFound(true);
    } finally {
        setIsLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    if (isEditMode && articleId) {
        fetchArticle(articleId);
    }
  }, [isEditMode, articleId, fetchArticle]);


  const onSubmit = async (data: ArticleFormValues) => {
    try {
      if (isEditMode && articleId) {
        await updateArticle(articleId, data);
        toast({ title: 'Berhasil!', description: 'Artikel telah berhasil diperbarui.' });
      } else {
        await addArticle(data);
        toast({ title: 'Berhasil!', description: 'Artikel baru telah berhasil ditambahkan.' });
      }
      router.push('/dashboard/articles');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    }
  };

  const handleAiImageReady = (url?: string) => {
    if (url) {
      setValue('imageUrl', url, { shouldValidate: true });
    }
    setIsAiModalOpen(false);
  };
  
  if (isLoading) {
     return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-48" />
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                    <Skeleton className="h-64 w-full" />
                </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (notFound) {
    return (
        <div className="p-4 sm:p-6 text-center">
            <h1 className="text-xl font-semibold">Artikel Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Artikel yang Anda coba edit tidak ada.</p>
            <Button onClick={() => router.push('/dashboard/articles')} className="mt-4">Kembali ke Daftar Artikel</Button>
        </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.push('/dashboard/articles')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {isEditMode ? 'Edit Artikel' : 'Buat Artikel Baru'}
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
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Artikel'}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Artikel</CardTitle>
                <CardDescription>
                  {isEditMode ? 'Perbarui judul dan konten untuk artikel Anda.' : 'Isi judul dan konten untuk artikel Anda.'}
                </CardDescription>
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
                      disabled={isSubmitting}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Konten</Label>
                    <Textarea
                      id="content"
                      className="min-h-32"
                      {...register('content')}
                      disabled={isSubmitting}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Gambar Artikel</CardTitle>
                 <CardDescription>
                  Tempelkan URL atau buat gambar baru dengan AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="imageUrl">URL Gambar</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="imageUrl"
                        type="text"
                        className="w-full pl-10"
                        placeholder="https://..."
                        {...register('imageUrl')}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                  </div>
                  <ImagePreview imageUrl={imageUrl} />
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAiModalOpen(true)} disabled={isSubmitting}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Buat dengan AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/articles')}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Artikel'}
          </Button>
        </div>
      </form>

      <AiImageDialog 
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onImageReady={handleAiImageReady}
        promptSuggestion='Contoh: "Stetoskop di atas meja dokter dengan latar belakang kabur"'
      />
    </>
  );
}
