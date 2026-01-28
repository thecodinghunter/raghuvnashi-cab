
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DriverFeesDataTable } from '@/components/driver/fees/FeesDataTable';
import { columns } from '@/components/driver/fees/Columns';
import { useFirestore, useUser } from '@/firebase';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { VendorFee } from '@/lib/vendor-fees';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

async function getDriverFees(firestore: any, driverId: string): Promise<VendorFee[]> {
  const feesQuery = query(collection(firestore, 'vendorFees'), where('driverId', '==', driverId));
  try {
    const querySnapshot = await getDocs(feesQuery);
    const fees = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const date = data.date?.toDate ? data.date.toDate().toISOString() : data.date;
      return { id: doc.id, ...data, date } as VendorFee;
    });
    return fees.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `vendorFees where driverId == ${driverId}`,
        operation: 'list',
      })
    );
    throw new Error('You do not have permission to view your fee history.');
  }
}

export default function DriverFeesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const { data: feesData = [], isLoading, isError, error } = useQuery<VendorFee[]>({
    queryKey: ['driverFees', user?.uid],
    queryFn: () => getDriverFees(firestore, user!.uid),
    enabled: !!firestore && !!user && !isUserLoading,
    retry: false,
  });

  const memoizedColumns = useMemo(() => columns, []);

  const isTodayPaid = useMemo(() => {
    if (!feesData || feesData.length === 0) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    return feesData.some(fee => {
        const feeDate = new Date(fee.date);
        feeDate.setHours(0, 0, 0, 0); // Normalize fee date
        return feeDate.getTime() === today.getTime() && fee.status === 'paid';
    });
  }, [feesData]);


   if (isLoading || isUserLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline text-primary">My Fee History</h2>
          <p className="text-muted-foreground">
            A record of your daily platform fee payments.
          </p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 neon-accent" disabled={isTodayPaid}>
            <Link href="/payment">{isTodayPaid ? 'Today\'s Fee Paid' : 'Pay Today\'s Fee'}</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>Only your payment history is shown below.</CardDescription>
        </CardHeader>
        <CardContent>
          {isError && <div className="p-8 text-center text-destructive">Error: {error.message}</div>}
          {!isError && <DriverFeesDataTable columns={memoizedColumns} data={feesData} />}
        </CardContent>
      </Card>
    </div>
  );
}
