
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
import { Loader2, Save, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';

const profileSchema = z.object({
  about: z.string().min(1, 'Deskripsi tidak boleh kosong'),
  vision: z.string().min(1, 'Visi tidak boleh kosong'),
  mission: z.string().min(1, 'Misi tidak boleh kosong'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
      reset(data); // Sync form state with the new saved data
      setIsDialogOpen(false); // Close dialog on success
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: error.message });
    }
  };
  
  const currentValues = form.watch();

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold md:text-2xl">Kelola Halaman Profil</h1>

      {/* Profile Content Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Konten "Tentang Kami"</CardTitle>
            <CardDescription>Ubah deskripsi, visi, dan misi yang ditampilkan di halaman profil publik.</CardDescription>
          </div>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" />
                    Ubah Konten
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Konten Profil</DialogTitle>
                    <DialogDescription>
                        Lakukan perubahan pada deskripsi, visi, atau misi Anda di sini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6 py-4">
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
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="secondary" disabled={isSubmitting}>Batal</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
           </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
            {isLoading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                 </div>
            ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Deskripsi Umum</h3>
                        <p className="whitespace-pre-wrap">{currentValues.about || 'Belum diisi.'}</p>
                    </div>
                    <hr/>
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Visi</h3>
                        <p className="whitespace-pre-wrap">{currentValues.vision || 'Belum diisi.'}</p>
                    </div>
                     <hr/>
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Misi</h3>
                        <p className="whitespace-pre-wrap">{currentValues.mission || 'Belum diisi.'}</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
