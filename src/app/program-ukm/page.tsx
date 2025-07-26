
'use server';

import { getPrograms, type Program } from '@/lib/programs';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Briefcase } from 'lucide-react';

async function fetchPrograms() {
  try {
    return await getPrograms();
  } catch (error) {
    console.error("Gagal memuat program UKM:", error);
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await fetchPrograms();
  const essentialPrograms = programs.filter(p => p.category === 'UKM Esensial');
  const developmentPrograms = programs.filter(p => p.category === 'UKM Pengembangan');

  const renderProgramList = (programList: Program[]) => (
    <ul className="space-y-6">
      {programList.map(program => (
        <li key={program.id}>
            <Card className="overflow-hidden shadow-md">
                <div className="grid md:grid-cols-3">
                    {program.imageUrl && (
                        <div className="md:col-span-1">
                            <AspectRatio ratio={4/3}>
                                <img src={program.imageUrl} alt={program.name} className="w-full h-full object-cover"/>
                            </AspectRatio>
                        </div>
                    )}
                    <div className={program.imageUrl ? "md:col-span-2" : "md:col-span-3"}>
                        <CardHeader>
                            <CardTitle>{program.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{program.description}</p>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <Briefcase className="h-16 w-16 text-primary" />
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Program UKM</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Jelajahi berbagai program dan inisiatif Upaya Kesehatan Masyarakat (UKM) yang kami tawarkan, dibagi menjadi kategori Esensial dan Pengembangan.
              </p>
            </div>

            <div className="mt-12 max-w-4xl mx-auto">
              {programs.length > 0 ? (
                <Accordion type="multiple" defaultValue={['esensial', 'pengembangan']} className="w-full">
                  <AccordionItem value="esensial">
                    <AccordionTrigger className="text-2xl font-semibold">UKM Esensial</AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {renderProgramList(essentialPrograms)}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pengembangan">
                    <AccordionTrigger className="text-2xl font-semibold">UKM Pengembangan</AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {renderProgramList(developmentPrograms)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <Card className="mt-12">
                    <CardHeader>
                        <CardTitle>Daftar Program</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground text-center py-16">
                        <p>
                            Saat ini belum ada program yang ditambahkan.
                        </p>
                        <p className="text-sm">
                            Nantikan pembaruan di mana kami akan menampilkan semua program unggulan kami di sini.
                        </p>
                    </CardContent>
                </Card>
              )}
            </div>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
