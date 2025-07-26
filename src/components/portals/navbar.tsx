
'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function PortalNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);

    const navLinks = [
      { href: "/", label: "Home" },
      { href: "/profil", label: "Profil" },
      { href: "/program-ukm", label: "Program UKM" },
      { href: "/galeri", label: "Galeri" },
      { href: "/laporan", label: "Laporan" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                {/* Desktop Logo and Navigation */}
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                        <span className="font-bold sm:inline-block">UKM PONJA</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navLinks.map(({ href, label }) => (
                            <Link key={label} href={href} className="transition-colors hover:text-foreground/80 text-foreground/60">
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu Trigger and Logo */}
                <div className="flex items-center md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Buka Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[240px]">
                            <div className="p-4">
                               <Link href="/" className="mb-8 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                    <HeartPulse className="h-6 w-6 text-primary" />
                                    <span className="font-bold">UKM PONJA</span>
                                </Link>
                                <nav className="mt-8 grid gap-4">
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
                                <div className="mt-8 border-t pt-4">
                                     <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full">Admin Login</Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Link href="/" className="flex items-center space-x-2 md:hidden">
                        <HeartPulse className="h-6 w-6 text-primary" />
                        <span className="font-bold sm:inline-block">UKM PONJA</span>
                    </Link>
                </div>
                
                {/* Desktop Login Button */}
                <div className="hidden flex-1 items-center justify-end md:flex">
                    <Link href="/login">
                        <Button variant="ghost">Admin Login</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
