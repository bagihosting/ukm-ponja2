
'use server';

import { getGalleryImages } from '@/lib/gallery';
import { Card } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';

async function fetchGalleryImages() {
  try {
    const images = await getGalleryImages();
    // Sorting on the server after fetching
    return images.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  } catch (error) {
    console.error("Gagal memuat gambar galeri:", error);
    return []; // Return empty array on error
  }
}

export default async function GalleryPage() {
  const images = await fetchGalleryImages();

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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                {images.length > 0 ? (
                    images.map(image => (
                        <Card key={image.id} className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <AspectRatio ratio={1} className="bg-muted">
                                <img
                                    src={image.url}
                                    alt={image.name}
                                    className="w-full h-full object-cover"
                                />
                            </AspectRatio>
                        </Card>
                    ))
                ) : (
                     <p className="col-span-full text-center text-muted-foreground py-16">
                        Belum ada gambar di galeri.
                    </p>
                )}
            </div>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
