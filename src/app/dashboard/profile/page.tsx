
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getProfileContent, updateProfileContent } from '@/lib/profile';
import type { ProfileContent } from '@/lib/constants';
import { defaultProfileContent } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  about: z.string().min(1, 'Deskripsi tidak boleh kosong'),
  vision: z.string().min(1, 'Visi tidak boleh kosong'),
  mission: z.string().min(1, 'Misi tidak boleh kosong'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileContent,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = form;

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getProfileContent();
      reset(profile); // Populate the form with data from Firestore
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Data',
        description: error.message || 'Gagal mengambil data dari server.',
      });
      reset(defaultProfileContent); // Reset to default on error
    } finally {
      setIsLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const onProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      await updateProfileContent(data);
      toast({ title: 'Berhasil', description: 'Konten profil berhasil diperbarui.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-lg font-semibold md:text-2xl">Kelola Halaman Profil</h1>
        <Card>
          <CardHeader>
            <CardTitle>Konten "Tentang Kami"</CardTitle>
            <CardDescription>Ubah deskripsi, visi, dan misi yang ditampilkan di halaman profil publik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold md:text-2xl">Kelola Halaman Profil</h1>

      {/* Profile Content Form */}
      <Card>
        <CardHeader>
          <CardTitle>Konten "Tentang Kami"</CardTitle>
          <CardDescription>Ubah deskripsi, visi, dan misi yang ditampilkan di halaman profil publik.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="about">Deskripsi Umum</Label>
              <Textarea id="about" {...register('about')} className="mt-2 min-h-[120px]" disabled={isSubmitting} />
              {errors.about && <p className="text-sm text-red-500 mt-1">{errors.about.message}</p>}
            </div>
            <div>
              <Label htmlFor="vision">Visi</Label>
              <Textarea id="vision" {...register('vision')} className="mt-2" disabled={isSubmitting} />
              {errors.vision && <p className="text-sm text-red-500 mt-1">{errors.vision.message}</p>}
            </div>
            <div>
              <Label htmlFor="mission">Misi</Label>
              <Textarea id="mission" {...register('mission')} className="mt-2" disabled={isSubmitting} />
              {errors.mission && <p className="text-sm text-red-500 mt-1">{errors.mission.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
