
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User, LogOut, Wallet, Map, History } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Map', href: '/live-map', icon: Map },
    { name: 'Ride History', href: '/history', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'My Fees', href: '/fees', icon: Wallet },
]

const WelcomeMessage = () => {
    const { user, isUserLoading } = useUser();
    if (isUserLoading) {
        return <Skeleton className="h-6 w-32" />;
    }
    return (
        <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-bold text-foreground">{user?.displayName || user?.email?.split('@')[0]}</span>
        </div>
    )
}

const Sidebar = ({ onLinkClick }: { onLinkClick?: () => void }) => {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    }

    const handleLinkClick = () => {
      if (onLinkClick) {
        onLinkClick();
      }
    }

  return (
    <aside className="w-full h-full bg-card p-4 flex flex-col justify-between">
      <div>
        <div className="mb-4 p-2">
            <WelcomeMessage />
        </div>
        <div className="flex flex-col space-y-2">
            {links.map((link) => (
                <Button 
                    asChild
                    key={link.name}
                    variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={handleLinkClick}
                >
                    <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.name}
                    </Link>
                </Button>
            ))}
        </div>
      </div>
      <div>
        <Button 
            variant="ghost"
            className="justify-start w-full"
            onClick={handleLogout}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
