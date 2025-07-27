
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, Link as LinkIcon, Wand2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addProgram, getProgram, updateProgram } from '@/lib/programs';
import { uploadImageToCloudinary } from '@/lib/image-hosting';
import { PROGRAM_CATEGORIES } from '@/lib/constants';
import { addGalleryImageRecord } from '@/lib/gallery';
import { categorizeImage } from '@/ai/flows/categorize-image-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AiImageDialog } from '@/components/portals/ai-image-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePreview } from '@/components/portals/image-preview';

const programSchema = z.object({
  name: z.string().min(1, { message: 'Nama program tidak boleh kosong.' }),
  description: z.string().min(1, { message: 'Deskripsi tidak boleh kosong.' }),
  category: z.enum(PROGRAM_CATEGORIES, { required_error: 'Kategori harus dipilih.' }),
  imageUrl: z.string().url({ message: "URL tidak valid" }).or(z.literal("")),
  personInChargeName: z.string().optional(),
  personInChargePhotoUrl: z.string().url({ message: "URL tidak valid" }).or(z.literal("")).optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

export default function NewProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('id');
  const isEditMode = Boolean(programId);

  const { toast } = useToast();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [picPhotoFile, setPicPhotoFile] = useState<File | null>(null);
  const [isUploadingPicPhoto, setIsUploadingPicPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
        name: '',
        description: '',
        imageUrl: '',
        personInChargeName: '',
        personInChargePhotoUrl: '',
    }
  });

  const imageUrl = watch('imageUrl');
  const picPhotoUrl = watch('personInChargePhotoUrl');

  const fetchProgram = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const program = await getProgram(id);
      if (program) {
        reset(program);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Program tidak ditemukan.' });
        setNotFound(true);
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Gagal Memuat', description: 'Gagal memuat data program.' });
       setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    if (isEditMode && programId) {
      fetchProgram(programId);
    }
  }, [isEditMode, programId, fetchProgram]);


  const onSubmit = async (data: ProgramFormValues) => {
    try {
      if (isEditMode && programId) {
        await updateProgram(programId, data);
        toast({ title: 'Berhasil!', description: 'Program telah berhasil diperbarui.' });
      } else {
        await addProgram(data);
        toast({ title: 'Berhasil!', description: 'Program baru telah berhasil ditambahkan.' });
      }
      router.push('/dashboard/programs');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    }
  };

  const handleImageReady = async (url: string, prompt: string) => {
    // 1. Set the image URL in the form
    setValue('imageUrl', url, { shouldValidate: true });
    setIsAiModalOpen(false);

    // 2. Save to gallery in the background
    try {
        const category = await categorizeImage({ imageUrl: url });
        const imageName = `${prompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.png`;
        await addGalleryImageRecord({ name: imageName, url: url, category });
        toast({ title: 'Berhasil!', description: 'Gambar dibuat & riwayatnya disimpan ke galeri.' });
    } catch (galleryError: any) {
        toast({
            variant: 'destructive',
            title: 'Gagal Simpan ke Galeri',
            description: 'Gambar berhasil dibuat, tapi gagal disimpan ke riwayat galeri.',
        });
    }
  };
  
  const handlePicPhotoUpload = async () => {
    if (!picPhotoFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Pilih file foto terlebih dahulu.' });
      return;
    }
    setIsUploadingPicPhoto(true);
    try {
      const url = await uploadImageToCloudinary(picPhotoFile);
      setValue('personInChargePhotoUrl', url, { shouldValidate: true });
      toast({ title: 'Berhasil!', description: 'Foto penanggung jawab berhasil diunggah.' });
      setPicPhotoFile(null);
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah Foto',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsUploadingPicPhoto(false);
    }
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
            <h1 className="text-xl font-semibold">Program Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Program yang Anda coba edit tidak ada.</p>
            <Button onClick={() => router.push('/dashboard/programs')} className="mt-4">Kembali ke Daftar Program</Button>
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
            onClick={() => router.push('/dashboard/programs')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {isEditMode ? 'Edit Program' : 'Buat Program Baru'}
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/programs')}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Program'}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Program</CardTitle>
                <CardDescription>
                  {isEditMode ? 'Perbarui detail untuk program UKM Anda.' : 'Isi detail untuk program UKM Anda.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nama Program</Label>
                    <Input
                      id="name"
                      type="text"
                      className="w-full"
                      {...register('name')}
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="category">Kategori</Label>
                     <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROGRAM_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      className="min-h-32"
                      {...register('description')}
                      disabled={isSubmitting}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Penanggung Jawab</CardTitle>
                <CardDescription>Informasi penanggung jawab program (opsional).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="personInChargeName">Nama Penanggung Jawab</Label>
                  <Input
                    id="personInChargeName"
                    type="text"
                    className="w-full"
                    {...register('personInChargeName')}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="pic-photo">Foto Penanggung Jawab</Label>
                   <Input 
                      id="pic-photo" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setPicPhotoFile(e.target.files?.[0] || null)}
                      disabled={isUploadingPicPhoto || isSubmitting}
                    />
                    {picPhotoFile && (
                       <Button type="button" size="sm" onClick={handlePicPhotoUpload} disabled={isUploadingPicPhoto || isSubmitting}>
                        {isUploadingPicPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Unggah Foto
                      </Button>
                    )}
                  <ImagePreview imageUrl={picPhotoUrl} />
                  {errors.personInChargePhotoUrl && <p className="text-sm text-red-500">{errors.personInChargePhotoUrl.message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Gambar Program</CardTitle>
                <CardDescription>
                  Opsional. Tempelkan URL atau buat gambar.
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
          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/programs')}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Program'}
          </Button>
        </div>
      </form>

      <AiImageDialog 
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onImageReady={handleImageReady}
        promptSuggestion='Contoh: "Kegiatan penyuluhan kesehatan di desa"'
      />
    </>
  );
}
