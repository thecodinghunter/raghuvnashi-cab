
'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FirebaseClientProvider } from '@/firebase';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import SplashScreenComponent from '@/components/splash-screen';

const SuspenseSplashScreen = () => {
    return <Skeleton className="w-full h-screen" />;
}

// Main Providers Component for the whole app
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Show splash for 1.5 seconds only on first load
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreenComponent />}
      <Suspense fallback={<SuspenseSplashScreen/>}>
        <QueryClientProvider client={queryClient}>
            <FirebaseClientProvider>
                {children}
            </FirebaseClientProvider>
        </QueryClientProvider>
        </Suspense>
    </>
  );
}
