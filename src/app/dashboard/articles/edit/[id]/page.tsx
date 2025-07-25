
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getArticle, updateArticle, Article } from '@/lib/articles';
import { Skeleton } from '@/components/ui/skeleton';

const articleSchema = z.object({
  title: z.string().min(1, { message: 'Judul tidak boleh kosong.' }),
  content: z.string().min(1, { message: 'Konten tidak boleh kosong.' }),
  image: z.instanceof(File).optional(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
  });

  const fetchArticle = useCallback(async (articleId: string) => {
    setPageLoading(true);
    try {
      const fetchedArticle = await getArticle(articleId);
      if (fetchedArticle) {
        setArticle(fetchedArticle);
        reset({
          title: fetchedArticle.title,
          content: fetchedArticle.content,
        });
        if (fetchedArticle.imageUrl) {
          setImagePreview(fetchedArticle.imageUrl);
        }
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
    if (!article) return;
    setLoading(true);
    try {
      await updateArticle(article.id, {
        title: data.title,
        content: data.content,
        imageFile: data.image,
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
              <div className="grid gap-2">
                 <Controller
                  name="image"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label
                          htmlFor="image-upload"
                          className="flex justify-center w-full h-32 px-4 transition bg-transparent border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                        >
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="Pratinjau gambar"
                              width={128}
                              height={128}
                              className="object-contain"
                            />
                          ) : (
                            <span className="flex items-center space-x-2">
                              <Upload className="h-6 w-6 text-gray-600" />
                              <span className="font-medium text-gray-600">
                                Klik untuk unggah
                              </span>
                            </span>
                          )}
                           <Input
                             id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            {...rest}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              onChange(file);
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setImagePreview(article?.imageUrl || null);
                              }
                            }}
                          />
                        </Label>
                      </div>
                    </>
                  )}
                />
                 {errors.image && <p className="text-sm text-red-500">{errors.image.message}</p>}
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
  );
}

