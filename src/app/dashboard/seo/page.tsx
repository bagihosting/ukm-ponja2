
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSEOSettings, updateSEOSettings } from '@/lib/seo';
import { Skeleton } from '@/components/ui/skeleton';

const seoSchema = z.object({
  title: z.string().min(1, { message: 'Judul situs tidak boleh kosong.' }),
  description: z.string().min(1, { message: 'Deskripsi situs tidak boleh kosong.' }),
  keywords: z.string().min(1, { message: 'Kata kunci tidak boleh kosong.' }),
});

type SEOFormValues = z.infer<typeof seoSchema>;

export default function SEOPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SEOFormValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      title: '',
      description: '',
      keywords: '',
    },
  });

  useEffect(() => {
    async function fetchSeoData() {
      setIsLoading(true);
      try {
        const seoData = await getSEOSettings();
        if (seoData) {
          reset(seoData);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Gagal Memuat',
          description: 'Gagal memuat pengaturan SEO.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSeoData();
  }, [reset, toast]);

  const onSubmit = async (data: SEOFormValues) => {
    try {
      await updateSEOSettings(data);
      toast({
        title: 'Berhasil!',
        description: 'Pengaturan SEO telah berhasil diperbarui.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    }
  };
  
  if (isLoading) {
    return (
        <div className="p-4 sm:p-6 space-y-4">
            <h1 className="text-lg font-semibold md:text-2xl">SEO</h1>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="text-lg font-semibold md:text-2xl">SEO</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan SEO</CardTitle>
            <CardDescription>
              Kelola judul, deskripsi, dan kata kunci untuk optimasi mesin pencari (SEO) situs Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Situs</Label>
              <Input
                id="title"
                {...register('title')}
                disabled={isSubmitting}
                placeholder="Contoh: UKM PONJA - Puskesmas Pondok Jagung"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Situs</Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={isSubmitting}
                className="min-h-24"
                placeholder="Contoh: Website resmi Upaya Kesehatan Masyarakat (UKM) Puskesmas Pondok Jagung, menyediakan informasi kesehatan, program, dan berita terbaru."
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Kata Kunci (dipisahkan koma)</Label>
              <Input
                id="keywords"
                {...register('keywords')}
                disabled={isSubmitting}
                placeholder="kesehatan, puskesmas, pondok jagung, ukm, ponja, tangerang selatan"
              />
               {errors.keywords && <p className="text-sm text-red-500">{errors.keywords.message}</p>}
            </div>
            
             <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Simpan Perubahan
                  </Button>
              </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
