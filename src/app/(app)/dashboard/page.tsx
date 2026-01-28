
'use client';
import { useMemo } from 'react';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  collection,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import DriverStats from '@/components/dashboard/DriverStats';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDriverStatus } from '@/hooks/use-driver-status';
import Link from 'next/link';

const LiveMap = dynamic(() => import('@/components/live-map/LiveMap'), {
  ssr: false,
});


type Ride = {
  id: string;
  fare: number;
  status: 'Completed' | 'Cancelled' | 'In Progress' | 'Requested';
  createdAt: Timestamp | Date;
};

type DashboardData = {
  totalRidesToday: number;
  todaysEarnings: number;
};

export default function DriverDashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { driverPosition } = useDriverStatus();

  // Real-time query for all rides for the current driver
  // Filtering for today's rides is done on the client-side to avoid complex queries
  const ridesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'rides'),
        where('driverId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: allDrives, loading: loadingRides } = useCollection<Ride>(ridesQuery);

  const dashboardData: DashboardData | null = useMemo(() => {
    if (loadingRides || isUserLoading) return null;
    if (!allDrives) return { totalRidesToday: 0, todaysEarnings: 0 };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysRides = allDrives.filter(ride => {
        const rideDate = ride.createdAt instanceof Timestamp ? ride.createdAt.toDate() : new Date(ride.createdAt);
        return rideDate >= todayStart;
    });

    const totalRidesToday = todaysRides.length;
    const todaysEarnings = todaysRides.reduce((acc, ride) => {
      return ride.status === 'Completed' ? acc + ride.fare : acc;
    }, 0);

    return {
        totalRidesToday,
        todaysEarnings,
    }
  }, [allDrives, isUserLoading, loadingRides]);


  if (dashboardData === null) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48 mb-4" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col">
       <div className="p-4 md:p-8 border-b">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                 <h1 className="text-3xl font-bold font-headline text-primary">
                    Driver Dashboard
                </h1>
                <p className="text-muted-foreground">
                    An overview of your earnings and activity.
                </p>
            </div>
            <Button asChild>
                <Link href="/live-map">
                    <Zap className="mr-2 h-4 w-4" /> Go to Live Map
                </Link>
            </Button>
         </div>
       </div>

       <div className="relative h-64 md:h-96 w-full">
        <LiveMap ride={null} driverPosition={driverPosition} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
      </div>

      <div className="p-4 md:p-8 space-y-6">
        <DriverStats data={dashboardData} />
      </div>
    </div>
  );
}
