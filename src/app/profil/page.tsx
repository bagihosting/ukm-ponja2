
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PortalNavbar } from '@/components/portals/navbar';
import { PortalFooter } from '@/components/portals/footer';
import { getProfileContent, getTeamMembers, type TeamMember } from '@/lib/profile';

const MemberCard = ({ name, role }: { name: string, role: string }) => (
  <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardContent className="p-6 flex flex-col items-center gap-4">
      <Avatar className="w-24 h-24">
        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
          {name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-bold text-lg">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </CardContent>
  </Card>
);

export default async function ProfilePage() {
  const profile = await getProfileContent();
  const teamMembers = await getTeamMembers();
  
  const pembina = teamMembers.filter(m => m.role.toLowerCase().includes('pembina') || m.role.toLowerCase().includes('penasihat'));
  const pengurusInti = teamMembers.filter(m => ['ketua umum', 'sekretaris', 'bendahara'].includes(m.role.toLowerCase()));
  const koordinator = teamMembers.filter(m => m.role.toLowerCase().includes('koordinator'));
  
  return (
    <div className="flex min-h-screen flex-col">
      <PortalNavbar />
      <main className="flex-1">
        <div className="container relative py-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h1 className="font-bold text-4xl leading-tight md:text-5xl">Profil UKM PONJA</h1>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Mengenal lebih dekat dengan Unit Kegiatan Mahasiswa Pondok Lanjut Usia (UKM PONJA).
              </p>
            </div>

            {/* About Us Section */}
            <section id="about" className="mt-16">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Tentang Kami</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground text-base leading-relaxed">
                        <p>{profile?.about}</p>
                        <p><strong>Visi kami</strong> {profile?.vision}</p>
                        <p><strong>Misi kami</strong> {profile?.mission}</p>
                    </CardContent>
                </Card>
            </section>

             {/* Organization Structure Section */}
            <section id="structure" className="mt-16">
                 <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                    <h2 className="font-bold text-3xl leading-tight md:text-4xl">Struktur Organisasi</h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Tim yang berdedikasi di balik layar UKM PONJA.
                    </p>
                </div>

                <div className="space-y-12 flex flex-col items-center">
                    {pembina.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                         {pembina.map(member => <MemberCard key={member.id} name={member.name} role={member.role} />)}
                      </div>
                    )}
                    
                    {pengurusInti.length > 0 && (
                      <div className="w-full border-t pt-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 justify-center">
                              {pengurusInti.map(member => <MemberCard key={member.id} name={member.name} role={member.role} />)}
                          </div>
                      </div>
                    )}
                    
                    {koordinator.length > 0 && (
                       <div className="w-full border-t pt-12">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center max-w-3xl mx-auto">
                              {koordinator.map(member => <MemberCard key={member.id} name={member.name} role={member.role} />)}
                          </div>
                      </div>
                    )}
                </div>
            </section>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
