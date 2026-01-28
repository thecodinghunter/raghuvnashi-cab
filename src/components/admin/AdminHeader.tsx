'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const AdminHeader = ({ onMenuToggle, isSidebarOpen }: AdminHeaderProps) => {
  const auth = useAuth();
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>('Admin');
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    if (auth?.currentUser) {
      setAdminName(auth.currentUser.displayName || 'Admin');
      setAdminEmail(auth.currentUser.email || '');
    }
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Hamburger Menu - Mobile Only */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="mr-2"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Header Title */}
        <div className="flex-1 md:flex-none">
          <h1 className="text-xl font-bold text-foreground">Jalaram Cabs Admin</h1>
        </div>

        {/* Admin Profile Dropdown - Mobile & Desktop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-auto flex items-center gap-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium leading-none">{adminName}</p>
                <p className="text-xs text-muted-foreground">{adminEmail}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{adminName}</p>
                <p className="text-xs text-muted-foreground">{adminEmail}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
