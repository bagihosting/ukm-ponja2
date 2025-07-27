
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { getArticle, updateArticle } from '@/lib/articles';
import { Skeleton } from '@/components/ui/skeleton';
import { addGalleryImageRecord } from '@/lib/gallery';
import { categorizeImage } from '@/ai/flows/categorize-image-flow';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AiImageDialog } from '@/components/portals/ai-image-dialog';

const articleSchema = z.object({
  title: z.string().min(1, { message: 'Judul tidak boleh kosong.' }),
  content: z.string().min(1, { message: 'Konten tidak boleh kosong.' }),
  imageUrl: z.string().url({ message: "URL tidak valid" }).or(z.literal("")),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function ImagePreview({ imageUrl }: { imageUrl: string | null | undefined; }) {
  if (!imageUrl) {
    return null;
  }
  return (
    <div className="space-y-2">
      <AspectRatio ratio={16 / 9} className="relative overflow-hidden rounded-md bg-muted">
        <img
          key={imageUrl}
          src={imageUrl}
          alt="Pratinjau Gambar"
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </AspectRatio>
    </div>
  );
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [pageLoading, setPageLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
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
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    }
  };

  const handleImageGenerated = async (url: string, prompt: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
    setIsAiModalOpen(false);
    try {
      const category = await categorizeImage({ imageUrl: url });
      const imageName = `${prompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.png`;
      await addGalleryImageRecord({ name: imageName, url: url, category });
      toast({ title: 'Berhasil!', description: 'Gambar dibuat & disimpan ke galeri.' });
    } catch (galleryError: any) {
         toast({
            variant: 'destructive',
            title: 'Gagal Simpan ke Galeri',
            description: 'Gambar berhasil dibuat, tapi gagal disimpan ke riwayat galeri.',
        });
    }
  }

  if (pageLoading) {
    return (
      <div className="space-y-4 p-4 md:p-0">
        <div className="flex items-center gap-4 mb-4">
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Artikel</CardTitle>
                <CardDescription>Perbarui judul dan konten untuk artikel Anda.</CardDescription>
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
          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/articles')} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
      
      <AiImageDialog 
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onImageGenerated={handleImageGenerated}
      />
    </>
  );
}
