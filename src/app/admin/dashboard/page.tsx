
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Car, Users, AlertTriangle } from 'lucide-react';
import AnimatedCounter from '@/components/admin/AnimatedCounter';
import RidesChart from '@/components/admin/RidesChart';
import PaymentsPieChart from '@/components/admin/PaymentsPieChart';
import { useFirestore } from '@/firebase';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Ride = {
    fare: number;
    status: string;
    createdAt: Timestamp | Date;
}

type User = {
    role: string;
    status: string;
}

type VendorFee = {
    status: 'paid' | 'unpaid';
    feeAmount: number;
}

type DashboardData = {
    totalRevenue: number;
    totalRidesToday: number;
    activeDrivers: number;
    unpaidVendors: number;
    ridesLast7Days: { date: string, rides: number }[];
    paymentStatus: { name: string, value: number, fill: string }[];
}

async function getDashboardData(firestore: any): Promise<DashboardData> {
    const ridesQuery = query(collection(firestore, 'rides'));
    const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'driver'));
    const feesQuery = query(collection(firestore, 'vendorFees'));

    try {
        const [ridesSnapshot, usersSnapshot, feesSnapshot] = await Promise.all([
            getDocs(ridesQuery),
            getDocs(usersQuery),
            getDocs(feesQuery)
        ]);

        const rides = ridesSnapshot.docs.map(doc => doc.data() as Ride);
        const drivers = usersSnapshot.docs.map(doc => doc.data() as User);
        const fees = feesSnapshot.docs.map(doc => doc.data() as VendorFee);

        // KPI Calculations
        const totalRevenue = rides.reduce((acc, ride) => ride.status === 'Completed' ? acc + ride.fare : acc, 0);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const totalRidesToday = rides.filter(ride => {
            const rideDate = (ride.createdAt as Timestamp).toDate();
            return rideDate >= todayStart;
        }).length;

        const activeDrivers = drivers.filter(driver => driver.status === 'approved').length;
        const unpaidVendors = fees.filter(fee => fee.status === 'unpaid').length;

        // Rides Last 7 Days Chart
        const ridesLast7Days: { date: string, rides: number }[] = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
            
            const count = rides.filter(ride => {
                const rideDate = (ride.createdAt as Timestamp).toDate();
                return rideDate >= dayStart && rideDate < dayEnd;
            }).length;
            
            ridesLast7Days.push({ date: days[d.getDay()], rides: count });
        }

        // Payment Status Pie Chart
        const paidAmount = fees.reduce((acc, fee) => fee.status === 'paid' ? acc + fee.feeAmount : acc, 0);
        const unpaidAmount = fees.reduce((acc, fee) => fee.status === 'unpaid' ? acc + fee.feeAmount : acc, 0);
        const paymentStatus = [
            { name: 'Paid', value: paidAmount, fill: 'hsl(var(--primary))' },
            { name: 'Unpaid', value: unpaidAmount, fill: 'hsl(var(--destructive))' },
        ];
        
        return {
            totalRevenue,
            totalRidesToday,
            activeDrivers,
            unpaidVendors,
            ridesLast7Days,
            paymentStatus
        };
    } catch(e: any) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `rides, users, vendorFees`,
            operation: 'list',
        }));
        throw new Error("Missing or insufficient permissions.");
    }
}


export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const { data, isLoading, isError, error } = useQuery<DashboardData>({
    queryKey: ['adminDashboard'],
    queryFn: () => getDashboardData(firestore),
    enabled: !!firestore,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">Dashboard</h1>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Skeleton className="lg:col-span-4 h-[400px]" />
                <Skeleton className="lg:col-span-3 h-[400px]" />
            </div>
        </div>
    )
  }

  if (isError) {
      return <div className="p-8 text-center text-destructive">Error loading dashboard: {error.message}</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rides Today
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter from={0} to={data?.totalRidesToday ?? 0} />
            </div>
            <p className="text-xs text-muted-foreground">Live count for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Drivers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter from={0} to={data?.activeDrivers ?? 0} />
            </div>
             <p className="text-xs text-muted-foreground">Total approved driver accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <span className="mr-1">₹</span>
              <AnimatedCounter from={0} to={data?.totalRevenue ?? 0} fractionDigits={2} />
            </div>
            <p className="text-xs text-muted-foreground">From all completed rides</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Vendors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
               <AnimatedCounter from={0} to={data?.unpaidVendors ?? 0} />
            </div>
            <p className="text-xs text-muted-foreground">Action required</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Rides per Day (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RidesChart data={data?.ridesLast7Days ?? []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Vendor Fee Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentsPieChart data={data?.paymentStatus ?? []}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
