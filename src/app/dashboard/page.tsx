
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || 'Admin';

  return (
    <>
      <div className="flex flex-1 items-center justify-center rounded-lg">
        <div className="w-full max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Selamat Datang, {displayName}!
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Senang melihat Anda kembali. Gunakan navigasi di samping untuk mengelola konten situs.
            </p>
        </div>
      </div>
    </>
  );
}
