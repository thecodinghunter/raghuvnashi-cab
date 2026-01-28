
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowLeft, Loader2, CircleCheck, CircleX } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { VendorFee } from '@/lib/vendor-fees';
import { DriverFeesDataTable } from '@/components/driver/fees/FeesDataTable';
import { columns as driverFeeColumns } from '@/components/driver/fees/Columns';

const DAILY_FEE = 250;

type PaymentStatus = 'idle' | 'processing' | 'success';

async function getTodaysFeeStatus(firestore: any, driverId: string): Promise<'paid' | 'unpaid' | 'N/A'> {
    if (!driverId) return 'N/A';

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const feesQuery = query(
        collection(firestore, 'vendorFees'),
        where('driverId', '==', driverId),
        where('date', '>=', todayStart),
        where('date', '<=', todayEnd)
    );

    const querySnapshot = await getDocs(feesQuery);

    if (!querySnapshot.empty) {
        const feeDoc = querySnapshot.docs[0].data() as VendorFee;
        return feeDoc.status;
    }
    
    return 'unpaid';
}

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


export default function PaymentPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentState, setPaymentState] = useState<PaymentStatus>('idle');

  const { data: feeStatus, isLoading } = useQuery({
      queryKey: ['todaysFeeStatus', user?.uid],
      queryFn: () => getTodaysFeeStatus(firestore, user!.uid),
      enabled: !isUserLoading && !!user,
      retry: false,
  });

  const { data: feesData = [], isLoading: isLoadingFees, isError, error } = useQuery<VendorFee[]>({
    queryKey: ['driverFees', user?.uid],
    queryFn: () => getDriverFees(firestore, user!.uid),
    enabled: !!firestore && !!user && !isUserLoading,
    retry: false,
  });

  const memoizedColumns = useMemo(() => driverFeeColumns, []);

  const handleSimulatedPayment = () => {
    setPaymentState('processing');
    setTimeout(() => {
        setPaymentState('success');
        toast({
            title: 'Payment Submitted for Verification',
            description: 'Your payment is being processed. An admin will confirm and update your account status shortly.',
        });
        queryClient.invalidateQueries({ queryKey: ['todaysFeeStatus', user?.uid] });
        queryClient.invalidateQueries({ queryKey: ['driverFees', user?.uid] });
    }, 3000);
  };
  
  const isPaid = feeStatus === 'paid';

  const renderContent = () => {
    if (isLoading || isUserLoading) {
        return (
            <div className="text-center flex flex-col items-center gap-6">
                <Skeleton className="h-12 w-48"/>
                <Skeleton className="h-16 w-full"/>
                 <Skeleton className="h-10 w-48"/>
            </div>
        )
    }

    if(paymentState === 'success' || isPaid) {
        return (
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center flex flex-col items-center gap-4 py-8"
            >
                <CircleCheck className="h-20 w-20 text-green-500" />
                <h2 className="text-2xl font-bold">
                    {paymentState === 'success' ? 'Payment Submitted!' : "Today's Fee is Paid!"}
                </h2>
                <p className="text-muted-foreground max-w-sm">
                    {paymentState === 'success' 
                        ? 'An administrator will verify your payment shortly. Your fee history is shown below.'
                        : 'You are all set for today. Your updated fee history is shown below.'}
                </p>
                <div className="w-full mt-4">
                  <DriverFeesDataTable columns={memoizedColumns} data={feesData} />
                </div>
                <Button variant="ghost" asChild className="mt-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </motion.div>
        )
    }

    return (
        <div className="text-center flex flex-col items-center gap-6">
            <div>
              <p className="text-muted-foreground">Amount Due Today</p>
              <p className="text-5xl font-bold">
                ₹{DAILY_FEE.toFixed(2)}
              </p>
            </div>

            <Badge variant="destructive" className="text-base"><CircleX className="mr-2"/>Fee Unpaid</Badge>

            <div className="w-full space-y-2">
              <Button
                size="lg"
                className="w-full text-lg font-bold"
                onClick={handleSimulatedPayment}
                disabled={paymentState === 'processing'}
              >
                {paymentState === 'processing' && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                {`Pay ₹${DAILY_FEE.toFixed(2)} Now`}
              </Button>
              <p className="text-xs text-muted-foreground">
                  An admin will verify and confirm your payment.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 md:py-12">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">
            Pay Daily Platform Fee
          </CardTitle>
          <CardDescription>
            Your account will be activated for the day upon payment confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AnimatePresence mode="wait">
                <motion.div
                    key={paymentState + (isPaid ? '-paid' : '-unpaid')}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
