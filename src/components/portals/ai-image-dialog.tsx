
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const resetState = () => {
    setPrompt('');
    setIsGenerating(false);
    setGeneratedImageUrl(null);
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
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
      const input: GenerateImageInput = { prompt };
      const result = await generateImage(input);
      
      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl); // Show preview
      } else {
        throw new Error('AI tidak mengembalikan URL gambar.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Gambar',
        description: `Terjadi kesalahan: ${error.message}`,
      });
      setIsGenerating(false); // Re-enable button on failure
    }
    // Note: isGenerating is kept true on success to show the preview and "Gunakan Gambar" button
  };

  const handleConfirm = () => {
    if (generatedImageUrl) {
      onImageGenerated(generatedImageUrl, prompt);
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Buat Gambar dengan AI</DialogTitle>
          <DialogDescription>
            Tulis deskripsi untuk gambar yang ingin Anda buat. AI akan membuatkannya untuk Anda.
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
              disabled={isGenerating}
            />
          </div>
           
          {(isGenerating || generatedImageUrl) && (
               <div className="space-y-2">
                  <Label>Hasil Gambar</Label>
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md border flex items-center justify-center">
                  {!generatedImageUrl ? (
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                      <img
                        src={generatedImageUrl}
                        alt="Gambar yang dibuat AI"
                        className="w-full h-full object-cover"
                      />
                  )}
                  </AspectRatio>
              </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isGenerating}>Batal</Button>
          </DialogClose>
          
          {generatedImageUrl ? (
             <Button type="button" onClick={handleConfirm}>
                Gunakan Gambar Ini
            </Button>
          ) : (
             <Button type="button" onClick={handleGenerate} disabled={isGenerating || !prompt}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Buat Gambar
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
