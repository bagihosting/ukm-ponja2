
'use server';

import { getPrograms, type Program } from '@/lib/programs';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Briefcase, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {programList.map(program => (
        <Card key={program.id} className="overflow-hidden shadow-md flex flex-col h-full">
            {program.imageUrl && (
                <AspectRatio ratio={16/9}>
                    <img src={program.imageUrl} alt={program.name} className="w-full h-full object-cover"/>
                </AspectRatio>
            )}
            <div className="flex flex-col flex-grow">
                <CardHeader>
                    <CardTitle>{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm">{program.description}</p>
                </CardContent>
                {program.personInChargeName && (
                  <CardFooter>
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={program.personInChargePhotoUrl} alt={program.personInChargeName} />
                            <AvatarFallback>
                                <UserCircle className="h-5 w-5"/>
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold">{program.personInChargeName}</p>
                            <p className="text-xs text-muted-foreground">Penanggung Jawab</p>
                        </div>
                      </div>
                  </CardFooter>
                )}
            </div>
        </Card>
      ))}
    </div>
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

            <div className="mt-12 max-w-5xl mx-auto">
              {programs.length > 0 ? (
                <Accordion type="multiple" defaultValue={['esensial', 'pengembangan']} className="w-full space-y-8">
                  <AccordionItem value="esensial">
                    <AccordionTrigger className="text-2xl font-semibold md:text-3xl">UKM Esensial</AccordionTrigger>
                    <AccordionContent className="pt-6">
                      {essentialPrograms.length > 0 ? renderProgramList(essentialPrograms) : <p className="text-muted-foreground text-center py-8">Belum ada program UKM Esensial.</p>}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pengembangan">
                    <AccordionTrigger className="text-2xl font-semibold md:text-3xl">UKM Pengembangan</AccordionTrigger>
                    <AccordionContent className="pt-6">
                      {developmentPrograms.length > 0 ? renderProgramList(developmentPrograms) : <p className="text-muted-foreground text-center py-8">Belum ada program UKM Pengembangan.</p>}
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
