
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Copy, FileText, Mic } from 'lucide-react';
import type { Slide } from '@/ai/flows/generate-slides-flow';
import { useToast } from '@/hooks/use-toast';

interface SlidesPreviewProps {
  slides: Slide[];
}

export function SlidesPreview({ slides }: SlidesPreviewProps) {
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleCopy = useCallback(() => {
    const slide = slides[current];
    if (!slide) return;
    
    const contentToCopy = `Judul: ${slide.title}\n\nIsi:\n${slide.content.map(point => `- ${point}`).join('\n')}\n\nCatatan Pembicara:\n${slide.speakerNotes}`;
    
    navigator.clipboard.writeText(contentToCopy).then(() => {
      toast({
        title: 'Berhasil Disalin!',
        description: `Konten untuk Slide ${current + 1} telah disalin.`,
      });
    });
  }, [current, slides, toast]);

  return (
    <div className="w-full">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="min-h-[400px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-2xl">{slide.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="flex gap-4">
                        <FileText className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                        <div className="space-y-2">
                            <h4 className="font-semibold">Poin Utama</h4>
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {slide.content.map((point, i) => (
                                <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Mic className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                        <div className="space-y-2">
                             <h4 className="font-semibold">Catatan Pembicara</h4>
                            <p className="text-muted-foreground">{slide.speakerNotes}</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground flex items-center justify-center gap-4">
        <span>
          Slide {current + 1} dari {slides.length}
        </span>
        <Button onClick={handleCopy} variant="outline" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Salin Konten Slide Ini
        </Button>
      </div>
    </div>
  );
}
