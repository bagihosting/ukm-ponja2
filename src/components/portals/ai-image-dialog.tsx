
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { addGalleryImageRecord } from '@/lib/gallery';
import { categorizeImage } from '@/ai/flows/categorize-image-flow';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { uploadImageToCloudinary } from '@/lib/image-hosting';


interface AiImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageReady: (url: string) => void;
  promptSuggestion?: string;
}

export function AiImageDialog({ 
  open, 
  onOpenChange, 
  onImageReady,
  promptSuggestion = 'Contoh: "Sebuah danau di pegunungan saat matahari terbenam"'
}: AiImageDialogProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDataUri, setGeneratedDataUri] = useState<string | null>(null);

  const resetState = () => {
    setPrompt('');
    setIsLoading(false);
    setGeneratedDataUri(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };
  
  const handleGenerateAndUse = async () => {
    if (!prompt) {
      toast({ variant: 'destructive', title: 'Error', description: 'Deskripsi gambar tidak boleh kosong.' });
      return;
    }
    setIsLoading(true);
    setGeneratedDataUri(null);

    try {
      // 1. Generate image and get back the data URI
      const { dataUri } = await generateImage({ prompt });
      
      if (!dataUri) {
         throw new Error('AI tidak mengembalikan data gambar.');
      }

      setGeneratedDataUri(dataUri);

      // 2. Upload to Cloudinary to get public URL
      const publicUrl = await uploadImageToCloudinary(dataUri);

      // 3. Categorize the image using its public URL
      const category = await categorizeImage({ imageUrl: publicUrl });
      const imageName = `${prompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.png`;
      
      // 4. Save to gallery history
      await addGalleryImageRecord({ name: imageName, url: publicUrl, category });
      
      toast({ title: 'Berhasil!', description: 'Gambar dibuat, diunggah, dan disimpan ke galeri.' });

      // 5. Pass the final public URL to the parent component
      onImageReady(publicUrl);

    } catch (error: any) {
      let errorMessage = `Terjadi kesalahan: ${error.message}`;
       if (error.message.includes("AI features are disabled")) {
          errorMessage = "Fitur AI dinonaktifkan. Pastikan Anda telah mengatur GEMINI_API_KEY di file .env Anda.";
      }
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Gambar',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Buat Gambar dengan AI</DialogTitle>
          <DialogDescription>
            Tulis deskripsi untuk gambar yang ingin Anda buat. AI akan membuat, mengunggah, dan menyimpannya ke galeri untuk Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Deskripsi Gambar (Prompt)</Label>
            <Textarea
              id="ai-prompt"
              placeholder={promptSuggestion}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>
           
          {isLoading && !generatedDataUri && (
               <div className="space-y-2">
                  <Label>Proses</Label>
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md border flex flex-col items-center justify-center space-y-2">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                       <p className="text-sm text-muted-foreground">Membuat gambar...</p>
                  </AspectRatio>
              </div>
          )}

          {generatedDataUri && (
              <div className="space-y-2">
                  <Label>Hasil Gambar</Label>
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md border">
                      <img src={generatedDataUri} alt="Generated AI" className="w-full h-full object-cover rounded-md"/>
                  </AspectRatio>
                  {isLoading && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center">
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                       Mengunggah dan menyimpan ke galeri...
                    </p>
                  )}
              </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>Batal</Button>
          </DialogClose>
          
           <Button type="button" onClick={handleGenerateAndUse} disabled={isLoading || !prompt}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Buat & Gunakan Gambar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
