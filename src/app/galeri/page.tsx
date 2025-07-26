
'use client';

import { useState, useEffect } from 'react';
import { getGalleryImages, type GalleryImage } from '@/lib/gallery';
import { Card } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ALL_CATEGORIES = 'Semua';

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGalleryImages() {
      setLoading(true);
      try {
        const fetchedImages = await getGalleryImages();
        const sortedImages = fetchedImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setImages(sortedImages);
        setFilteredImages(sortedImages);

        // Extract unique categories
        const uniqueCategories = [ALL_CATEGORIES, ...Array.from(new Set(sortedImages.map(img => img.category || 'Lain-lain')))];
        setCategories(uniqueCategories);

      } catch (error) {
        console.error("Gagal memuat gambar galeri:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGalleryImages();
  }, []);

  const handleFilter = (category: string) => {
    setActiveCategory(category);
    if (category === ALL_CATEGORIES) {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(image => image.category === category));
    }
  };

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
          {!loading && categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 my-8">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  onClick={() => handleFilter(category)}
                >
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
              {filteredImages.length > 0 ? (
                filteredImages.map(image => (
                  <Card key={image.id} className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                    <AspectRatio ratio={1} className="bg-muted relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </AspectRatio>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-16">
                  <p>Tidak ada gambar dalam kategori ini.</p>
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
