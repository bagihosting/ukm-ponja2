
'use server';

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { getProfileContent, type ProfileContent } from '@/lib/profile';
import { cn } from '@/lib/utils';
import React from 'react';

export default async function ProfilePage() {
  let profile: ProfileContent | null = null;
  let error: string | null = null;

  try {
    profile = await getProfileContent();
  } catch (e: any) {
    console.error("Failed to load profile data:", e);
    // Set a user-friendly error message to be displayed in the UI.
    error = "Gagal memuat data profil. Silakan coba lagi nanti.";
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12 md:py-20">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-extrabold text-4xl tracking-tight lg:text-5xl">Profil UKM PONJA</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Mengenal lebih dekat dengan Unit Kegiatan Mahasiswa Pondok Lanjut Usia (UKM PONJA).
              </p>
            </div>

            {error ? (
              <div className="text-center text-red-500 py-16">{error}</div>
            ) : (
              <>
                {/* About Us Section */}
                <section id="about" className="mt-16">
                    <Card className="shadow-xl shadow-slate-200/50 border-slate-100">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Tentang Kami</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground text-base leading-relaxed">
                            <p>{profile?.about || 'Deskripsi tentang UKM belum diisi.'}</p>
                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <div className="p-6 bg-slate-50 rounded-lg">
                                    <h3 className="font-bold text-foreground mb-2">Visi Kami</h3>
                                    <p>{profile?.vision || 'Visi belum diisi.'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-lg">
                                    <h3 className="font-bold text-foreground mb-2">Misi Kami</h3>
                                    <p>{profile?.mission || 'Misi belum diisi.'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
              </>
            )}
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
