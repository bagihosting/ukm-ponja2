
'use server';

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { getProfileContent, getTeamMembers, type TeamMember, type ProfileContent } from '@/lib/profile';
import { cn } from '@/lib/utils';
import React from 'react';

// Enhanced MemberCard for the new organization chart
const MemberCard = ({ name, role, className }: { name: string, role: string, className?: string }) => (
  <div className={cn("flex flex-col items-center text-center", className)}>
    <Avatar className="w-24 h-24 mb-4 shadow-lg border-4 border-background">
      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
        {name.split(' ').map(n => n[0]).join('').substring(0,2)}
      </AvatarFallback>
    </Avatar>
    <div className="text-center">
      <p className="font-bold text-lg text-foreground">{name}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  </div>
);


const OrgChartNode = ({ children, className }: { children: React.ReactNode, className?: string}) => (
    <div className={cn("relative flex flex-col items-center", className)}>
        {children}
    </div>
)

const OrgChartLevel = ({ children, className } : { children: React.ReactNode, className?: string}) => (
    <div className={cn("flex justify-center gap-8 md:gap-16", className)}>
        {children}
    </div>
)


export default async function ProfilePage() {
  let profile: ProfileContent | null = null;
  let teamMembers: TeamMember[] = [];
  let error: string | null = null;

  try {
    // Fetch both profile and team members data in parallel.
    [profile, teamMembers] = await Promise.all([
        getProfileContent(),
        getTeamMembers()
    ]);
  } catch (e: any) {
    console.error("Failed to load profile data:", e);
    // Set a user-friendly error message to be displayed in the UI.
    error = "Gagal memuat data profil. Silakan coba lagi nanti.";
  }
  
  // Sort members into their respective roles on the server side.
  // This logic is safe to run even if data fetching fails (arrays will be empty).
  const pembina = teamMembers.filter(m => m.role.toLowerCase().includes('pembina') || m.role.toLowerCase().includes('penasihat'));
  const ketua = teamMembers.find(m => m.role.toLowerCase() === 'ketua umum');
  const pengurusInti = teamMembers.filter(m => ['sekretaris', 'bendahara'].includes(m.role.toLowerCase()));
  const koordinator = teamMembers.filter(m => m.role.toLowerCase().includes('koordinator'));
  
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

                {/* Organization Structure Section */}
                <section id="structure" className="mt-20">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
                        <h2 className="font-extrabold text-3xl tracking-tight lg:text-4xl">Struktur Organisasi</h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            Tim yang berdedikasi di balik layar UKM PONJA.
                        </p>
                    </div>

                    <div className="relative flex flex-col items-center org-chart space-y-12 md:space-y-20">
                      {/* Pembina */}
                      {pembina.length > 0 && (
                          <OrgChartLevel>
                              {pembina.map(member => (
                                  <OrgChartNode key={member.id}>
                                      <MemberCard name={member.name} role={member.role} />
                                  </OrgChartNode>
                              ))}
                          </OrgChartLevel>
                      )}
                      
                      {/* Connecting Line */}
                      {pembina.length > 0 && ketua && <div className="w-px h-12 md:h-20 bg-slate-300"></div>}

                      {/* Ketua Umum */}
                      {ketua && (
                          <OrgChartLevel>
                              <OrgChartNode className="relative before:content-[''] before:absolute before:h-px before:w-full before:bg-slate-300 before:top-[-2.5rem] md:before:top-[-5rem] before:left-[-50%]">
                                  <MemberCard name={ketua.name} role={ketua.role} />
                              </OrgChartNode>
                          </OrgChartLevel>
                      )}
                      
                      {/* Connecting Lines */}
                      {ketua && pengurusInti.length > 0 && <div className="relative w-full h-12 md:h-20">
                            <div className="absolute top-0 left-1/2 w-px h-full bg-slate-300"></div>
                            <div className="absolute bottom-0 left-[25%] md:left-[35%] w-[50%] md:w-[30%] h-px bg-slate-300"></div>
                        </div>}

                      {/* Pengurus Inti */}
                      {pengurusInti.length > 0 && (
                          <OrgChartLevel className="w-full md:w-auto md:max-w-3xl justify-around relative">
                            <div className="absolute top-[-2.5rem] left-1/2 w-px h-[2.5rem] bg-slate-300"></div>
                              {pengurusInti.map(member => (
                                  <OrgChartNode key={member.id} className="relative before:content-[''] before:absolute before:w-px before:h-6 before:bg-slate-300 before:top-[-1.5rem]">
                                      <MemberCard name={member.name} role={member.role} />
                                  </OrgChartNode>
                              ))}
                          </OrgChartLevel>
                      )}
                      
                      {/* Connecting Line */}
                      {pengurusInti.length > 0 && koordinator.length > 0 && <div className="w-px h-12 md:h-20 bg-slate-300"></div>}

                      {/* Koordinator */}
                      {koordinator.length > 0 && (
                          <OrgChartLevel className="relative flex-wrap before:content-[''] before:absolute before:h-px before:w-[80%] md:before:w-[60%] before:bg-slate-300 before:top-[-2.5rem] md:before:top-[-5rem]">
                              {koordinator.map(member => (
                                  <OrgChartNode key={member.id} className="w-1/2 md:w-1/4 p-4 relative before:content-[''] before:absolute before:w-px before:h-6 before:bg-slate-300 before:top-[-1.5rem]">
                                      <MemberCard name={member.name} role={member.role} />
                                  </OrgChartNode>
                              ))}
                          </OrgChartLevel>
                      )}

                      {teamMembers.length === 0 && (
                        <div className="text-center text-muted-foreground py-16">
                            Struktur organisasi belum diatur.
                        </div>
                      )}
                    </div>
                </section>
              </>
            )}
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
