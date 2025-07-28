
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { uploadImageAndCreateGalleryRecord } from '@/lib/gallery';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AiImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // This callback is now more generic. It can signify completion or pass a URL.
  // In the gallery page, it just signals completion. In the articles/programs page, it passes the URL.
  onImageReady: (url?: string) => void; 
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
  const [loadingStep, setLoadingStep] = useState(''); // To provide better feedback
  const [generatedDataUri, setGeneratedDataUri] = useState<string | null>(null);

  const resetState = () => {
    setPrompt('');
    setIsLoading(false);
    setGeneratedDataUri(null);
    setLoadingStep('');
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
      // 1. Generate image from AI and get back the data URI
      setLoadingStep('Membuat gambar dengan AI...');
      const { dataUri } = await generateImage({ prompt });
      
      if (!dataUri) {
         throw new Error('AI tidak mengembalikan data gambar.');
      }

      // Show the preview immediately
      setGeneratedDataUri(dataUri);

      // Create a file name for the gallery record
      const imageName = `${prompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.png`;

      // 2. Use the centralized function to handle upload, categorization, and db record creation
      setLoadingStep('Mengunggah & menyimpan ke galeri...');
      const publicUrl = await uploadImageAndCreateGalleryRecord(dataUri, imageName);
      
      toast({ title: 'Berhasil!', description: 'Gambar dibuat dan disimpan ke galeri.' });

      // 3. Pass the final public URL to the parent component and close
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
      setIsLoading(false); // Stop loading on error
      setLoadingStep('');
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
                       <p className="text-sm text-muted-foreground">{loadingStep || 'Memulai proses...'}</p>
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
                       {loadingStep}
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
