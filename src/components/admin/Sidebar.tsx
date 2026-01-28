
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Car, Users, LogOut, User, Wallet, ShieldAlert, Settings } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Rides', href: '/admin/rides', icon: Car },
    { name: 'Drivers', href: '/admin/drivers', icon: Users },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Complaints', href: '/admin/complaints', icon: ShieldAlert },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

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
    <aside className="w-full h-full bg-background p-4 flex flex-col justify-between">
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
