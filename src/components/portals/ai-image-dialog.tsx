
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { uploadImageToFreeImage } from '@/lib/image-hosting';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AiImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated: (url: string, prompt: string) => void;
  promptSuggestion?: string;
}

export function AiImageDialog({ 
  open, 
  onOpenChange, 
  onImageGenerated,
  promptSuggestion = 'Contoh: "Sebuah danau di pegunungan saat matahari terbenam"'
}: AiImageDialogProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<string | null>(null);

  const resetState = () => {
    setPrompt('');
    setIsLoading(false);
    setGeneratedImageDataUri(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };
  
  const handleGenerate = async () => {
    if (!prompt) {
      toast({ variant: 'destructive', title: 'Error', description: 'Deskripsi gambar tidak boleh kosong.' });
      return;
    }
    setIsLoading(true);
    setGeneratedImageDataUri(null);
    try {
      // 1. Generate image, get back the data URI
      const input: GenerateImageInput = { prompt };
      const result = await generateImage(input);
      
      if (result.imageDataUri) {
        // 2. Upload the data URI to the hosting service
        const publicUrl = await uploadImageToFreeImage(result.imageDataUri);
        
        // 3. Pass the final public URL to the parent component
        onImageGenerated(publicUrl, prompt);
        handleOpenChange(false);
      } else {
        throw new Error('AI tidak mengembalikan data URI gambar.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat atau Mengunggah Gambar',
        description: `Terjadi kesalahan: ${error.message}`,
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
            Tulis deskripsi untuk gambar yang ingin Anda buat. AI akan membuat dan mengunggahnya untuk Anda.
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
           
          {isLoading && (
               <div className="space-y-2">
                  <Label>Proses</Label>
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md border flex flex-col items-center justify-center space-y-2">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                       <p className="text-sm text-muted-foreground">Membuat & mengunggah gambar...</p>
                  </AspectRatio>
              </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>Batal</Button>
          </DialogClose>
          
           <Button type="button" onClick={handleGenerate} disabled={isLoading || !prompt}>
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
