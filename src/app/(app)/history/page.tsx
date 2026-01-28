
'use client';
// Helper to convert Firestore Timestamp or {seconds, nanoseconds} to Date
function toDateSafe(val: any): Date {
  if (!val) return new Date(NaN);
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  if (typeof val.seconds === 'number' && typeof val.nanoseconds === 'number') {
    return new Date(val.seconds * 1000 + Math.floor(val.nanoseconds / 1e6));
  }
  return new Date(val);
}

import { useState, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, Timestamp, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import RideHistoryCard from '@/components/history/RideHistoryCard';
import RideDetailModal from '@/components/history/RideDetailModal';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Ride } from '@/lib/types';

type FilterType = 'today' | 'week' | 'month';


async function getDriverRides(firestore: any, driverId: string): Promise<Ride[]> {
  if (!driverId) return [];
  const ridesQuery = query(collection(firestore, 'rides'), where('driverId', '==', driverId));
  try {
    const querySnapshot = await getDocs(ridesQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      return { ...data, id: doc.id, createdAt } as Ride;
    });
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `rides where driverId == ${driverId}`,
        operation: 'list',
      })
    );
    throw new Error('You do not have permission to view your ride history.');
  }
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [filter, setFilter] = useState<FilterType>('week');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const { data: rides, isLoading, isError, error } = useQuery({
    queryKey: ['driverRides', user?.uid],
    queryFn: () => getDriverRides(firestore, user!.uid),
    enabled: !!user && !!firestore,
    retry: false,
  });

  const filteredRides = useMemo(() => {
    if (!rides) return [];
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (filter) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      default:
        startDate = subDays(now, 7);
    }
    
    return rides
      .filter(ride => {
        const rideDate = toDateSafe(ride.createdAt);
        return rideDate >= startDate && rideDate <= endDate;
      })
      .sort((a, b) => {
          const dateA = toDateSafe(a.createdAt);
          const dateB = toDateSafe(b.createdAt);
          return dateB.getTime() - dateA.getTime();
      });

  }, [rides, filter]);


  const renderContent = () => {
    if (isLoading || isUserLoading) {
      return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )
    }

    if (isError) {
        return <p className="text-center text-destructive py-8">{error.message}</p>
    }

    if (filteredRides.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No rides found for this period.</p>
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {filteredRides.map((ride, index) => (
                    <RideHistoryCard 
                        key={ride.id} 
                        ride={ride} 
                        index={index}
                        onClick={() => setSelectedRide(ride)}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
        <div className="p-4 md:p-8 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <h1 className="text-3xl font-bold font-headline text-primary">Ride History</h1>
            <p className="text-muted-foreground">Review your past rides and earnings.</p>
            <div className="flex space-x-2 mt-4">
                <Button variant={filter === 'today' ? 'secondary' : 'ghost'} onClick={() => setFilter('today')}>Today</Button>
                <Button variant={filter === 'week' ? 'secondary' : 'ghost'} onClick={() => setFilter('week')}>This Week</Button>
                <Button variant={filter === 'month' ? 'secondary' : 'ghost'} onClick={() => setFilter('month')}>This Month</Button>
            </div>
        </div>

        <div className="p-4 md:p-8">
            {renderContent()}
        </div>

        <AnimatePresence>
            {selectedRide && (
                <RideDetailModal ride={selectedRide} onClose={() => setSelectedRide(null)} />
            )}
        </AnimatePresence>
    </div>
  );
}
