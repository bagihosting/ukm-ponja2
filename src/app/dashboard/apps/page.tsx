
'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Aplikasi</h1>
        <Link href="#">
          <Button size="sm" className="gap-1" disabled>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tambah Aplikasi</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aplikasi</CardTitle>
          <CardDescription>Kelola aplikasi atau integrasi pihak ketiga di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-semibold">Belum ada aplikasi yang ditambahkan.</p>
            <p className="text-sm mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
