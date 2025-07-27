
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { HeartPulse, Menu, Loader2, Newspaper, Image as ImageIcon, Briefcase, Settings, LogOut, TrendingUp } from 'lucide-react';

import { getClientAuth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function UserNav() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const auth = getClientAuth();
      await signOut(auth);
      router.push('/login');
      toast({
        title: 'Logout',
        description: 'Anda telah berhasil keluar.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Logout',
        description: error.message,
      });
    }
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'AD';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
           <Avatar>
            <AvatarImage src={user?.photoURL ?? undefined} />
            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard/settings" passHref>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Pengaturan</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const navLinks = [
  { href: "/dashboard", icon: HeartPulse, label: "Dashboard", disabled: false },
  { href: "/dashboard/articles", icon: Newspaper, label: "Artikel", disabled: false },
  { href: "/dashboard/gallery", icon: ImageIcon, label: "Galeri", disabled: false },
  { href: "/dashboard/programs", icon: Briefcase, label: "Program UKM", disabled: false },
  { href: "/dashboard/seo", icon: TrendingUp, label: "SEO", disabled: false },
  { href: "/dashboard/settings", icon: Settings, label: "Pengaturan", disabled: false },
];

function SidebarNav() {
    const pathname = usePathname();
    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map(({ href, icon: Icon, label, disabled }) => (
            <Link 
                key={label} 
                href={disabled ? "#" : href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === href && "bg-muted text-primary",
                    disabled && "cursor-not-allowed opacity-50"
                )}
                aria-disabled={disabled}
                onClick={(e) => disabled && e.preventDefault()}
            >
                <Icon className="h-4 w-4" />
                {label}
            </Link>
            ))}
        </nav>
    )
}

function MobileSheet() {
    const pathname = usePathname();
    return (
        <Sheet>
            <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="sr-only">Navigasi Utama</SheetTitle>
                    <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                        <HeartPulse className="h-6 w-6" />
                        <span className="text-lg">UKM PONJA</span>
                    </Link>
                </SheetHeader>
                <nav className="grid items-start p-4 text-base font-medium">
                    {navLinks.map(({ href, icon: Icon, label, disabled }) => (
                    <Link 
                        key={label} 
                        href={disabled ? "#" : href}
                        className={cn(
                            "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                            pathname === href && "bg-muted text-foreground",
                            disabled && "cursor-not-allowed opacity-50"
                        )}
                        aria-disabled={disabled}
                        onClick={(e) => disabled && e.preventDefault()}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <HeartPulse className="h-6 w-6" />
              <span>UKM PONJA</span>
            </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
            <SidebarNav />
        </div>
      </aside>
      <div className="flex flex-col sm:ml-60">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <MobileSheet />
          <div className="flex-1">
            {/* Header content can go here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
        <footer className="mt-auto border-t bg-background px-4 py-4 sm:px-6">
            <p className="text-center text-sm text-muted-foreground">
                Dibangun dengan ❤️ oleh Rani Kirana.
            </p>
        </footer>
      </div>
    </div>
  );
}
