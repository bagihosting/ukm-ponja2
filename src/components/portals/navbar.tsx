
'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse, Menu, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export function PortalNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const { user, loading } = useAuth();

    const navLinks = [
      { href: "/", label: "Home" },
      { href: "/#articles", label: "Artikel" },
      { href: "/program-ukm", label: "Program UKM" },
      { href: "/galeri", label: "Galeri" },
      { href: "/laporan", label: "Laporan" },
    ];

    const AuthButton = () => {
      if (loading) {
        return <Skeleton className="h-9 w-24 rounded-md" />;
      }

      if (user) {
        return (
          <Link href="/dashboard" passHref>
            <Button variant="outline">
                <LayoutDashboard className="mr-2 h-4 w-4"/>
                Dasbor
            </Button>
          </Link>
        );
      }

      return (
        <Link href="/login" passHref>
          <Button variant="ghost">
            Login
          </Button>
        </Link>
      );
    };
    
    const AuthButtonMobile = () => {
        if (loading) {
            return <Skeleton className="h-10 w-full" />;
        }
        if (user) {
            return (
                 <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4"/>
                        Dasbor
                    </Button>
                </Link>
            )
        }
        return (
            <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                    <LogIn className="mr-2 h-4 w-4"/>
                    Login
                </Button>
            </Link>
        )
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                {/* Logo and Mobile Menu Trigger */}
                <div className="flex items-center">
                    {/* Mobile Menu Trigger */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Buka Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[240px]">
                            <SheetHeader>
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                            </SheetHeader>
                            <div className="p-4 flex flex-col h-full">
                               <Link href="/" className="mb-8 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                    <HeartPulse className="h-6 w-6 text-primary" />
                                    <span className="font-bold">UKM PONJA</span>
                                </Link>
                                <nav className="grid gap-4">
                                    {navLinks.map(({ href, label }) => (
                                        <Link 
                                            key={label} 
                                            href={href} 
                                            className="text-lg font-medium text-foreground/80 hover:text-foreground"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-auto border-t pt-4">
                                    <AuthButtonMobile />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Logo */}
                    <Link href="/" className="mr-6 hidden md:flex items-center space-x-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                        <span className="font-bold sm:inline-block">UKM PONJA</span>
                    </Link>
                </div>

                {/* Mobile-only Logo */}
                 <div className="flex-1 flex justify-center md:hidden">
                    <Link href="/" className="flex items-center space-x-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                        <span className="font-bold">UKM PONJA</span>
                    </Link>
                </div>


                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
                    {navLinks.map(({ href, label }) => (
                        <Link key={label} href={href} className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {label}
                        </Link>
                    ))}
                </nav>
                
                {/* Auth Button */}
                <div className="flex items-center justify-end">
                    <div className="hidden md:block">
                        <AuthButton />
                    </div>
                    {/* Placeholder to balance the flexbox for mobile logo centering */}
                     <div className="md:hidden" style={{ width: '40px' }}></div>
                </div>
            </div>
        </header>
    );
}
