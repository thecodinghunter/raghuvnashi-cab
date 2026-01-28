'use client';
import { useMemo, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DriversDataTable } from '@/components/admin/drivers/DriversDataTable';
import { columns } from '@/components/admin/drivers/Columns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DatePicker } from '@/components/ui/datepicker';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { VendorFee } from '@/lib/vendor-fees';
import type { Driver } from '@/lib/types';

const DAILY_FEE_AMOUNT = 250;

async function getDriversWithFees(firestore: any, selectedDate: Date): Promise<Driver[]> {
    const driversQuery = query(collection(firestore, 'users'), where('role', '==', 'driver'));
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const feesQuery = query(collection(firestore, 'vendorFees'), where('date', '>=', startOfDay), where('date', '<=', endOfDay));
    
    try {
        const [driversSnapshot, feesSnapshot] = await Promise.all([
            getDocs(driversQuery),
            getDocs(feesQuery)
        ]);

        const feesMap = new Map<string, { feeId: string; status: 'paid' | 'unpaid' }>();
        feesSnapshot.forEach(doc => {
            const fee = doc.data() as VendorFee;
            feesMap.set(fee.driverId, { feeId: doc.id, status: fee.status });
        });
        
        const drivers: Driver[] = driversSnapshot.docs.map(doc => {
            const driverData = { id: doc.id, ...doc.data() } as Driver;
            const feeInfo = feesMap.get(driverData.id);
            driverData.feeStatus = feeInfo ? feeInfo.status : 'unpaid';
            driverData.feeId = feeInfo ? feeInfo.feeId : undefined;
            return driverData;
        });

        return drivers;
    } catch (error: any) {
         errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: 'users or vendorFees',
                operation: 'list',
            })
        );
        throw new Error('You do not have permission to list drivers or fees.');
    }
}


export default function DriversPage() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: drivers = [], isLoading, isError, error } = useQuery<Driver[]>({
    queryKey: ['drivers', date?.toISOString().split('T')[0]],
    queryFn: () => getDriversWithFees(firestore, date || new Date()),
    enabled: !!firestore && !!date,
    retry: false,
  });

  const onUpdateStatus = async (driverId: string, status: 'approved' | 'blocked') => {
    const driverRef = doc(firestore, 'users', driverId);
    try {
        await updateDoc(driverRef, { status });
        toast({ title: `Driver has been ${status}.` });
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
    } catch (e: any) {
        const permissionError = new FirestorePermissionError({
            path: driverRef.path,
            operation: 'update',
            requestResourceData: { status }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update driver status.'});
    }
  };

  const onMarkFeeAsPaid = async (driver: Driver) => {
    if (!date) return;
    
    const batch = writeBatch(firestore);
    
    if (driver.feeId) {
        // Fee record exists, just update it
        const feeRef = doc(firestore, 'vendorFees', driver.feeId);
        batch.update(feeRef, { status: 'paid' });
    } else {
        // Fee record does not exist, create it
        const newFeeRef = doc(collection(firestore, 'vendorFees'));
        batch.set(newFeeRef, {
            driverId: driver.id,
            driverName: driver.name,
            date: Timestamp.fromDate(date),
            feeAmount: DAILY_FEE_AMOUNT,
            status: 'paid'
        });
    }

    try {
      await batch.commit();
      toast({ title: `Fee for ${driver.name} marked as paid.` });
      queryClient.invalidateQueries({ queryKey: ['drivers', date?.toISOString().split('T')[0]] });
    } catch (e: any) {
       const permissionError = new FirestorePermissionError({
            path: `vendorFees/${driver.feeId || '(new)'}`,
            operation: 'write',
            requestResourceData: { status: 'paid' }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update fee status.' });
    }
  };

   const handleExportToCsv = () => {
    if (!drivers.length) {
      toast({ variant: 'destructive', title: 'No data to export' });
      return;
    }
    const headers = ['Driver ID', 'Name', 'Email', 'Phone Number', 'Vehicle Type', 'Plate Number', 'Driver Status', `Fee Status (${date?.toLocaleDateString()})`];
    const csvRows = [
      headers.join(','),
      ...drivers.map(driver => [
        `"${driver.id}"`,
        `"${driver.name}"`,
        `"${driver.email}"`,
        `"${driver.phoneNumber}"`,
        `"${driver.vehicleType}"`,
        `"${driver.plateNumber}"`,
        `"${driver.status}"`,
        `"${driver.feeStatus || 'unpaid'}"`
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `drivers_fees_${date?.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const memoizedColumns = useMemo(() => columns({ onUpdateStatus, onMarkFeeAsPaid }), [firestore, date]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Driver Management</CardTitle>
          <CardDescription>
            View drivers and their daily fee payment status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-4">
              <DatePicker date={date} setDate={setDate} />
              <Button variant="outline" onClick={handleExportToCsv}><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
          </div>
          {isLoading && <div className="p-8 text-center">Loading drivers...</div>}
          {isError && <div className="p-8 text-center text-destructive">Error: {error.message}</div>}
          {!isLoading && !isError && <DriversDataTable columns={memoizedColumns} data={drivers} />}
        </CardContent>
      </Card>
    </div>
  );
}
