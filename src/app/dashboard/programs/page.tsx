
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Program UKM</h1>
        <Link href="#">
          <Button size="sm" className="gap-1" disabled>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tambah Program</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program</CardTitle>
          <CardDescription>Kelola program UKM yang ada di sini.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center text-muted-foreground py-8">
              Fitur ini sedang dalam pengembangan.
           </div>
        </CardContent>
      </Card>
    </>
  );
}
