
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { askDoctor, type AskDoctorInput } from '@/ai/flows/ask-doctor-flow';
import { HeartPulse, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AiDoctor() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        variant: 'destructive',
        title: 'Pertanyaan Kosong',
        description: 'Silakan masukkan pertanyaan kesehatan Anda.',
      });
      return;
    }

    setIsLoading(true);
    setAnswer('');

    try {
      const input: AskDoctorInput = { question };
      const result = await askDoctor(input);
      if (result.answer) {
        setAnswer(result.answer);
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
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <HeartPulse className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Tanya AI Dokter</CardTitle>
        <CardDescription className="text-lg">
          Punya pertanyaan seputar kesehatan? Tanyakan pada asisten AI kami.
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
             <>
              <Sparkles className="mr-2 h-4 w-4" />
              Tanyakan
            </>
          )}
        </Button>
      </CardContent>

      {answer && (
        <CardFooter>
          <Alert>
            <AlertTitle className="font-semibold">Jawaban AI Dokter:</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap text-foreground">
              {answer}
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
