'use client';

import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { Car } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { usePathname } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PlatformSettings } from '@/lib/platform-settings';

// Tenant Context
export type Tenant = {
    id: string;
    companyName: string;
    appLogoUrl: string;
};

interface TenantContextType {
    tenant: Tenant | null;
    isTenantLoading: boolean;
}

const defaultTenant: Tenant = {
    id: 'jalaram_cabs_default',
    companyName: 'Raghuvanshi Auto Services',
    appLogoUrl: "",
}

const TenantContext = createContext<TenantContextType>({ tenant: defaultTenant, isTenantLoading: true });

export const useTenant = () => useContext(TenantContext);

const SplashScreen = () => {
    const { tenant } = useTenant();
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                {tenant?.appLogoUrl ? (
                    <div className="relative h-20 w-20">
                        <Image src={tenant.appLogoUrl} alt="App Logo" fill sizes="80px" className="rounded-full object-cover" />
                    </div>
                ) : (
                    <Car className="h-20 w-20 text-primary" />
                )}
                <span className="text-2xl font-bold font-headline text-primary">
                    {tenant?.companyName || 'Raghuvanshi Auto Services'}
                </span>
            </div>
        </div>
    )
}

const TenantProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Reduced from 1500ms to 500ms for faster transitions

        return () => clearTimeout(timer);
    }, []);

    return (
        <TenantContext.Provider value={{ tenant: defaultTenant, isTenantLoading: isLoading }}>
            {isLoading ? <SplashScreen /> : children}
        </TenantContext.Provider>
    );
}


export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const noHeaderPaths = ['/login', '/signup'];
    const showHeader = !noHeaderPaths.some(path => pathname.startsWith(path));

    return (
        <TenantProvider>
            {showHeader && <AppHeader />}
            <main>{children}</main>
        </TenantProvider>
    );
}
