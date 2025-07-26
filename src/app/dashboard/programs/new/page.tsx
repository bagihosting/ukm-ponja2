
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, Link as LinkIcon, Wand2, Upload, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addProgram } from '@/lib/programs';
import { uploadImageToFreeImage } from '@/lib/image-hosting';
import { PROGRAM_CATEGORIES } from '@/lib/constants';
import type { ProgramCategory } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import ImagePreview from '@/components/portals/image-preview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const programSchema = z.object({
  name: z.string().min(1, { message: 'Nama program tidak boleh kosong.' }),
  description: z.string().min(1, { message: 'Deskripsi tidak boleh kosong.' }),
  category: z.enum(PROGRAM_CATEGORIES, { required_error: 'Kategori harus dipilih.' }),
  imageUrl: z.string().url({ message: "URL tidak valid" }).or(z.literal("")),
  personInChargeName: z.string().optional(),
  personInChargePhotoUrl: z.string().url({ message: "URL tidak valid" }).or(z.literal("")).optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function NewProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [picPhotoFile, setPicPhotoFile] = useState<File | null>(null);
  const [isUploadingPicPhoto, setIsUploadingPicPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
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

  const onSubmit = async (data: ProgramFormValues) => {
    setLoading(true);
    try {
      await addProgram({
        name: data.name,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        personInChargeName: data.personInChargeName,
        personInChargePhotoUrl: data.personInChargePhotoUrl,
      });
      toast({
        title: 'Berhasil!',
        description: 'Program baru telah berhasil ditambahkan.',
      });
      router.push('/dashboard/programs');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt) {
      toast({ variant: 'destructive', title: 'Error', description: 'Deskripsi gambar tidak boleh kosong.' });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const input: GenerateImageInput = { prompt: aiPrompt };
      const result = await generateImage(input);
      if (result.imageUrl) {
        setValue('imageUrl', result.imageUrl, { shouldValidate: true });
        toast({ title: 'Berhasil!', description: 'Gambar berhasil dibuat dan URL telah ditambahkan.' });
        setIsAiModalOpen(false);
      } else {
        throw new Error('AI tidak mengembalikan URL gambar.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Gambar',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  const handlePicPhotoUpload = async () => {
    if (!picPhotoFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Pilih file foto terlebih dahulu.' });
      return;
    }
    setIsUploadingPicPhoto(true);
    try {
      const dataUri = await fileToDataUri(picPhotoFile);
      const url = await uploadImageToFreeImage(dataUri);
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
            Buat Program Baru
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
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Program
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Program</CardTitle>
                <CardDescription>
                  Isi detail untuk program UKM Anda.
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
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="category">Kategori</Label>
                     <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="pic-photo">Foto Penanggung Jawab</Label>
                   <Input 
                      id="pic-photo" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setPicPhotoFile(e.target.files?.[0] || null)}
                      disabled={isUploadingPicPhoto}
                    />
                    {picPhotoFile && (
                       <Button type="button" size="sm" onClick={handlePicPhotoUpload} disabled={isUploadingPicPhoto}>
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
                      />
                    </div>
                    {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                  </div>
                  <ImagePreview imageUrl={imageUrl} />
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAiModalOpen(true)}>
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
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Program
          </Button>
        </div>
      </form>

      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Gambar dengan AI</DialogTitle>
            <DialogDescription>
              Tulis deskripsi untuk gambar yang ingin Anda buat. AI akan membuatkannya untuk Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Deskripsi Gambar</Label>
              <Textarea
                id="ai-prompt"
                placeholder='Contoh: "Kegiatan penyuluhan kesehatan di desa"'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGeneratingImage}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isGeneratingImage}>Batal</Button>
            </DialogClose>
            <Button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage || !aiPrompt}>
              {isGeneratingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : "Buat Gambar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
