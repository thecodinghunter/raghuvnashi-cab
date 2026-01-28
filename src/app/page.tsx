'use client';
    
import { useUser } from '@/firebase';
import RideBookingWrapper from '@/components/booking/RideBookingWrapper';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // We need the user to be loaded to create a ride request
  if (isUserLoading) {
    return (
       <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
          {/* Loading state */}
       </div>
    )
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      <RideBookingWrapper user={user} />
    </div>
  );
}
