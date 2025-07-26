
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';

export default function ProgramsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Program UKM</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Jelajahi berbagai program dan inisiatif yang kami tawarkan.
              </p>
            </div>

            <Card className="mt-12">
                <CardHeader>
                    <CardTitle>Daftar Program</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground text-center py-16">
                    <p>
                        Fitur program UKM sedang dalam pengembangan.
                    </p>
                    <p className="text-sm">
                        Nantikan pembaruan di mana kami akan menampilkan semua program unggulan kami di sini.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
