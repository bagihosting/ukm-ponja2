
'use client';

import { useEffect } from 'react';
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
  title: z.string().min(1, 'Judul situs tidak boleh kosong.'),
  description: z.string().min(1, 'Deskripsi meta tidak boleh kosong.'),
  keywords: z.string().min(1, 'Kata kunci tidak boleh kosong.'),
});

type SEOFormValues = z.infer<typeof seoSchema>;

export default function SeoSettingsPage() {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isLoading },
  } = useForm<SEOFormValues>({
    resolver: zodResolver(seoSchema),
  });

  useEffect(() => {
    async function fetchSeoData() {
      try {
        const data = await getSEOSettings();
        if (data) {
          reset(data);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Gagal Memuat Data SEO',
          description: 'Tidak dapat mengambil pengaturan SEO dari database.',
        });
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
      // Reset form with new values to clear "dirty" state
      reset(data);
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
        <div>
            <h1 className="text-lg font-semibold md:text-2xl mb-4">Pengaturan SEO</h1>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <Skeleton className="h-10 w-28" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div>
        <h1 className="text-lg font-semibold md:text-2xl mb-4">Pengaturan SEO</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>SEO Global</CardTitle>
                    <CardDescription>
                        Kelola judul, deskripsi, dan kata kunci default untuk situs Anda. Ini akan membantu mesin pencari seperti Google memahami dan memberi peringkat pada situs Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Situs</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="Contoh: UKM PONJA - Puskesmas Pondok Jagung"
                        />
                         <p className="text-sm text-muted-foreground">
                           Judul yang muncul di tab browser dan hasil pencarian.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi Meta</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Contoh: Situs resmi Upaya Kesehatan Masyarakat (UKM) Puskesmas Pondok Jagung, menyediakan informasi kesehatan, program, dan artikel terbaru."
                            className="min-h-24"
                        />
                         <p className="text-sm text-muted-foreground">
                           Deskripsi singkat (sekitar 160 karakter) yang muncul di bawah judul pada hasil pencarian.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="keywords">Kata Kunci</Label>
                        <Input
                            id="keywords"
                            {...register('keywords')}
                            placeholder="kesehatan, puskesmas, pondok jagung, ukm, promosi kesehatan"
                        />
                        <p className="text-sm text-muted-foreground">
                           Daftar kata kunci yang relevan dengan situs Anda, dipisahkan dengan koma.
                        </p>
                    </div>
                     <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !isDirty}>
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
