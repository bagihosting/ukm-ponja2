
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || 'Admin';

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg">
        <Card className="w-full max-w-2xl text-center shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">Selamat Datang, {displayName}!</CardTitle>
                <CardDescription className="text-md text-muted-foreground sm:text-lg">Senang melihat Anda kembali. Mari kita mulai.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-lg">
                    <img 
                        src="https://media.giphy.com/media/J2bB5g3hMb10A/giphy.gif"
                        alt="Animasi Denyut Jantung"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
