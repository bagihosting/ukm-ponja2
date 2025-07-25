
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Loader2, Link as LinkIcon, Wand2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addArticle } from '@/lib/articles';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generateImage } from '@/ai/flows/generate-image-flow';

const articleSchema = z.object({
  title: z.string().min(1, { message: 'Judul tidak boleh kosong.' }),
  content: z.string().min(1, { message: 'Konten tidak boleh kosong.' }),
  imageUrl: z.string().url({ message: 'URL gambar tidak valid.' }).optional().or(z.literal('')),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith('data:image')) {
    return true;
  }
  try {
    const newUrl = new URL(url);
    // Ensure it's http or https and has a valid hostname with a dot.
    return (newUrl.protocol === 'http:' || newUrl.protocol === 'https:') && newUrl.hostname.includes('.');
  } catch (e) {
    return false;
  }
};

export default function NewArticlePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
  });

  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: ArticleFormValues) => {
    setLoading(true);
    try {
      await addArticle({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || undefined,
      });
      toast({
        title: 'Berhasil!',
        description: 'Artikel baru telah berhasil ditambahkan.',
      });
      router.push('/dashboard/articles');
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
    if (!prompt) {
        toast({ variant: 'destructive', title: 'Error', description: 'Deskripsi gambar tidak boleh kosong.' });
        return;
    }
    setIsGenerating(true);
    try {
        const { imageUrl } = await generateImage({ prompt });
        setValue('imageUrl', imageUrl, { shouldValidate: true });
        toast({ title: 'Berhasil!', description: 'Gambar telah berhasil dibuat oleh AI.' });
        setIsDialogOpen(false); // Close dialog on success
    } catch (error) {
        toast({ variant: 'destructive', title: 'Gagal Membuat Gambar', description: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
        setIsGenerating(false);
    }
  };

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
          Buat Artikel Baru
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
            Simpan Artikel
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Detail Artikel</CardTitle>
              <CardDescription>
                Isi judul dan konten untuk artikel Anda.
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
              <CardDescription>
                Tempelkan URL atau buat gambar dengan AI.
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
                      type="url"
                      className="w-full pl-10"
                      placeholder="https://contoh.com/gambar.jpg"
                      {...register('imageUrl')}
                    />
                  </div>
                  {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Buat dengan AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Buat Gambar dari Teks</DialogTitle>
                      <DialogDescription>
                        Jelaskan gambar yang ingin Anda buat. AI akan membuatnya untuk Anda.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="prompt">Deskripsi Gambar</Label>
                      <Textarea 
                        id="prompt" 
                        placeholder="Contoh: seekor kucing oranye tidur di atas tumpukan buku"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleGenerateImage} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Buat Gambar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {imageUrl && isValidUrl(imageUrl) && (
                  <div className="aspect-video relative">
                    <Image
                      src={imageUrl}
                      alt="Pratinjau Gambar"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
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
          Simpan Artikel
        </Button>
      </div>
    </form>
  );
}
