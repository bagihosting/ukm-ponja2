
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileContent,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getProfileContent();
      profileForm.reset(profile);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Data',
        description: 'Gagal mengambil data dari server.',
      });
      profileForm.reset(defaultProfileContent);
    } finally {
      setLoading(false);
    }
  }, [profileForm, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setSavingProfile(true);
    try {
      await updateProfileContent(data);
      toast({ title: 'Berhasil', description: 'Konten profil berhasil diperbarui.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: error.message });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
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
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="about">Deskripsi Umum</Label>
              <Textarea id="about" {...profileForm.register('about')} className="mt-2 min-h-[120px]" />
              {profileForm.formState.errors.about && <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.about.message}</p>}
            </div>
            <div>
              <Label htmlFor="vision">Visi</Label>
              <Textarea id="vision" {...profileForm.register('vision')} className="mt-2" />
              {profileForm.formState.errors.vision && <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.vision.message}</p>}
            </div>
            <div>
              <Label htmlFor="mission">Misi</Label>
              <Textarea id="mission" {...profileForm.register('mission')} className="mt-2" />
              {profileForm.formState.errors.mission && <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.mission.message}</p>}
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Perubahan Konten
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
