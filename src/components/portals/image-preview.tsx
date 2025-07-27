
'use client';

import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImagePreviewProps {
    imageUrl: string | null | undefined;
}

export function ImagePreview({ imageUrl }: ImagePreviewProps) {
  if (!imageUrl) {
    return null;
  }
  return (
    <div className="space-y-2">
      <AspectRatio ratio={16 / 9} className="relative overflow-hidden rounded-md bg-muted">
        <img
          key={imageUrl}
          src={imageUrl}
          alt="Pratinjau Gambar"
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </AspectRatio>
    </div>
  );
}
