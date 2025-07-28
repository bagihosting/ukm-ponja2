
'use client';

import { useState, useEffect } from 'react';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { Card } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Semua', 'Gambar', 'Video'] as const;
type Category = typeof CATEGORIES[number];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGalleryImages() {
      setLoading(true);
      try {
        const fetchedImages = await getGalleryImages();
        const sortedImages = fetchedImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setImages(sortedImages);
        setFilteredImages(sortedImages);
      } catch (error) {
        console.error("Gagal memuat media galeri:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGalleryImages();
  }, []);

  const handleFilter = (category: Category) => {
    setActiveCategory(category);
    if (category === 'Semua') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(image => image.category === category));
    }
  };

  const getCloudinaryVideoThumbnail = (url: string) => {
    return url.replace(/\.(mp4|mov|webm)$/, '.jpg');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h1 className="font-bold text-4xl leading-tight md:text-5xl">Galeri Kegiatan</h1>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Dokumentasi visual dari berbagai acara dan kegiatan yang telah kami selenggarakan.
            </p>
          </div>

          {/* Category Filters */}
          {!loading && images.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 my-8">
              {CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  onClick={() => handleFilter(category)}
                >
                  {category === 'Gambar' && <ImageIcon className="mr-2 h-4 w-4" />}
                  {category === 'Video' && <Video className="mr-2 h-4 w-4" />}
                  {category}
                </Button>
              ))}
            </div>
          )}

          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                {Array.from({ length: 8 }).map((_, index) => (
                    <AspectRatio key={index} ratio={1}>
                        <Skeleton className="h-full w-full rounded-lg" />
                    </AspectRatio>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-12">
              {filteredImages.length > 0 ? (
                filteredImages.map(image => (
                  <Card key={image.id} className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                    <AspectRatio ratio={1} className="bg-muted relative">
                      <img
                        src={image.category === 'Video' ? getCloudinaryVideoThumbnail(image.url) : image.url}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {image.category === 'Video' && (
                              <Video className="h-12 w-12 text-white" />
                          )}
                       </div>
                    </AspectRatio>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-16">
                  <p>Tidak ada media dalam kategori ini.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
