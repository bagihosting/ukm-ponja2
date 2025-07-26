
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImagePreviewProps {
  imageUrl: string | null | undefined;
}

export default function ImagePreview({ imageUrl }: ImagePreviewProps) {
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
          // Basic error handling for broken image links
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </AspectRatio>
    </div>
  );
}
