
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Car, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useTenant } from '@/app/main-layout';
import AdminSidebar from '@/components/admin/Sidebar';
import DriverSidebar from '@/components/layout/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';


const Logo = () => {
  const { tenant, isTenantLoading } = useTenant();

  return (
    <Link href="/" className="flex items-center gap-2">
      {isTenantLoading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        tenant?.appLogoUrl ? (
          <div className="relative h-8 w-8">
            <Image src={tenant.appLogoUrl} alt="App Logo" fill sizes="32px" className="rounded-full object-cover" />
          </div>
        ) : (
          <Car className="h-7 w-7 text-primary neon-primary" />
        )
      )}
      {isTenantLoading ? (
        <Skeleton className="h-7 w-36" />
      ) : (
        <span className="text-xl font-bold font-headline text-primary">
          {tenant?.companyName || 'Raghuvanshi Auto Services'}
        </span>
      )}
    </Link>
  );
};

const UserMenu = () => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const userAvatar = getPlaceholderImage('user-avatar');

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile', user?.uid, 'short'],
    queryFn: async () => {
      if (!user?.uid || !firestore) return null;
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        return docSnap.exists() ? docSnap.data() as { role: 'driver' | 'user' | 'admin' } : null;
      } catch (e) {
        console.error("Failed to fetch user profile for header", e);
        return null;
      }
    },
    enabled: !isUserLoading && !!user && !!firestore,
  });

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <Button variant="ghost" disabled className="h-10 w-10 rounded-full">
        <Skeleton className="h-10 w-10 rounded-full" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  const FallbackIcon = () => {
    if (userProfile?.role === 'driver') {
      return <Car className="h-6 w-6" />
    }
    return <User className="h-6 w-6" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            {userAvatar?.imageUrl && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
            <AvatarFallback>
              <FallbackIcon />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


const MobileNav = () => {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isDriverApp = ['/dashboard', '/live-map', '/history', '/profile', '/fees', '/payment'].some(p => pathname.startsWith(p));
  const isAppPage = isDriverApp || isAdmin;

  if (!isAppPage) return null;

  return (
    <div className="md:hidden">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          {isAdmin ? (
            <AdminSidebar onLinkClick={() => setIsSheetOpen(false)} />
          ) : (
            <DriverSidebar onLinkClick={() => setIsSheetOpen(false)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export const AppHeader = () => {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup'].some(p => pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Logo />
        </div>

        {!isAuthPage && (
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        )}
      </div>
    </header>
  );
};
