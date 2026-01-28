'use client';
import { useMemo } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { columns } from '@/components/admin/rides/Columns';
import { RidesDataTable } from '@/components/admin/rides/RidesDataTable';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Ride } from '@/lib/types';

async function getRides(firestore: any): Promise<Ride[]> {
  const ridesQuery = query(collection(firestore, 'rides'));
  try {
    const querySnapshot = await getDocs(ridesQuery);
    const rides = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Firestore timestamps need to be converted to Dates for consistency
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        return { id: doc.id, ...data, createdAt } as Ride;
    });
    return rides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e: any) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'rides',
      operation: 'list'
    }));
    throw new Error('You do not have permission to list rides.');
  }
}


export default function RidesPage() {
  const firestore = useFirestore();
  const memoizedColumns = useMemo(() => columns, []);

  const { data: rides = [], isLoading, isError, error } = useQuery<Ride[]>({
    queryKey: ['rides'],
    queryFn: () => getRides(firestore),
    enabled: !!firestore,
    retry: false,
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Rides Management</CardTitle>
        </CardHeader>
        <CardContent>
           {isLoading && <div className="p-8 text-center">Loading rides...</div>}
           {isError && <div className="p-8 text-center text-destructive">{error.message}</div>}
           {!isLoading && !isError && <RidesDataTable columns={memoizedColumns} data={rides} />}
        </CardContent>
      </Card>
    </div>
  );
}
