
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Copy, Wand2, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { Skeleton } from '@/components/ui/skeleton';

const imageGeneratorSchema = z.object({
  prompt: z.string().min(5, { message: 'Deskripsi harus memiliki setidaknya 5 karakter.' }),
});

type ImageGeneratorFormValues = z.infer<typeof imageGeneratorSchema>;

export default function ImageGeneratorPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const form = useForm<ImageGeneratorFormValues>({
    resolver: zodResolver(imageGeneratorSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: ImageGeneratorFormValues) => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
      const input: GenerateImageInput = { prompt: data.prompt };
      const result = await generateImage(input);
      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        toast({ title: 'Berhasil!', description: 'Gambar berhasil dibuat.' });
      } else {
        throw new Error('AI tidak mengembalikan URL gambar.');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Gambar',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (!generatedImageUrl) return;
    navigator.clipboard.writeText(generatedImageUrl);
    toast({
      title: 'URL Disalin!',
      description: 'URL gambar telah disalin ke clipboard.',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">AI Image Generator</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Buat Gambar Baru</CardTitle>
            <CardDescription>
              Masukkan deskripsi (prompt) untuk gambar yang ingin Anda buat secara online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="prompt">Deskripsi Gambar</Label>
                      <FormControl>
                        <Textarea
                          id="prompt"
                          placeholder='Contoh: "Sebuah danau di pegunungan saat matahari terbenam, gaya lukisan cat minyak"'
                          className="min-h-[120px]"
                          disabled={isGenerating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat Gambar...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Buat Gambar
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hasil Gambar</CardTitle>
            <CardDescription>Gambar yang Anda buat akan muncul di sini.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            {isGenerating ? (
              <div className="w-full aspect-video">
                <Skeleton className="w-full h-full rounded-md" />
              </div>
            ) : generatedImageUrl ? (
              <div className="space-y-4 w-full">
                <div className="aspect-video relative border rounded-md overflow-hidden">
                  <Image
                    src={generatedImageUrl}
                    alt="Gambar yang dibuat oleh AI"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button variant="secondary" className="w-full" onClick={handleCopyUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Salin URL Gambar
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12" />
                <p>Belum ada gambar yang dibuat.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
