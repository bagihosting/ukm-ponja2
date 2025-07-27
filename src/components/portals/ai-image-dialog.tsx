
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AiImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageReady: (url: string, prompt: string) => void;
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

  const resetState = () => {
    setPrompt('');
    setIsLoading(false);
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
    try {
      // 1. Generate image and get back the public URL directly
      const result = await generateImage({ prompt });
      
      if (result.publicUrl) {
        // 2. Pass the public URL to the parent component
        onImageReady(result.publicUrl, prompt);
      } else {
        throw new Error('AI tidak mengembalikan URL gambar.');
      }
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
