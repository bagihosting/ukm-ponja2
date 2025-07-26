
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { askDoctor, type AskDoctorInput } from '@/ai/flows/ask-doctor-flow';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { HeartPulse, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

export function AiDoctor() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  
  const isLoading = isAsking || isGeneratingImage;

  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        variant: 'destructive',
        title: 'Pertanyaan Kosong',
        description: 'Silakan masukkan pertanyaan kesehatan Anda.',
      });
      return;
    }

    setIsAsking(true);
    setAnswer('');
    setImageUrl('');

    try {
      // 1. Get the text answer and image suggestion
      const input: AskDoctorInput = { question };
      const result = await askDoctor(input);
      
      if (result.answer) {
        setAnswer(result.answer);
        
        // 2. If there's an image suggestion, generate the image in parallel
        if (result.imageSuggestion) {
            setIsGeneratingImage(true);
            try {
                const imageInput: GenerateImageInput = { prompt: result.imageSuggestion };
                const imageResult = await generateImage(imageInput);
                if (imageResult.imageUrl) {
                    setImageUrl(imageResult.imageUrl);
                }
            } catch (imageError: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Gagal Membuat Gambar',
                    description: `Terjadi kesalahan saat membuat gambar: ${imageError.message}`,
                });
            } finally {
                setIsGeneratingImage(false);
            }
        }
      } else {
        throw new Error('AI tidak memberikan jawaban.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mendapatkan Jawaban',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <HeartPulse className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Tanya Dokter Puskesmas</CardTitle>
        <CardDescription className="text-lg">
          Punya pertanyaan seputar kesehatan? Tanyakan pada Dokter kami.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Contoh: Apa saja gejala umum dari demam berdarah?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          disabled={isLoading}
          className="resize-none"
        />
        <Button onClick={handleAsk} disabled={isLoading} className="w-full">
          {isAsking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses Jawaban...
            </>
          ) : (
             <>
              <Sparkles className="mr-2 h-4 w-4" />
              Tanyakan
            </>
          )}
        </Button>
      </CardContent>

      {(isAsking || answer) && (
        <CardFooter>
          <div className="w-full">
             <AlertTitle className="font-semibold text-xl mb-4">Jawaban Dokter Puskesmas:</AlertTitle>
             <div className="grid md:grid-cols-2 gap-6 items-start">
                 <div className="space-y-4">
                    {isGeneratingImage ? (
                        <Skeleton className="w-full aspect-video rounded-lg" />
                    ) : imageUrl ? (
                        <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden border">
                            <img src={imageUrl} alt="Ilustrasi jawaban dokter" className="w-full h-full object-cover" />
                        </AspectRatio>
                    ) : null}
                 </div>
                 <div>
                    {isAsking ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <Alert className="border-none p-0">
                            <AlertDescription className="whitespace-pre-wrap text-foreground text-base">
                            {answer}
                            </AlertDescription>
                        </Alert>
                    )}
                 </div>
             </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
