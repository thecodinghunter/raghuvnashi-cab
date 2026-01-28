'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { UserProfile, Ride } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewUserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

async function getUserRides(firestore: any, userId: string): Promise<Ride[]> {
  const ridesQuery = query(collection(firestore, 'rides'), where('userId', '==', userId));
  const querySnapshot = await getDocs(ridesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
}

export const ViewUserHistoryModal = ({ isOpen, onClose, user }: ViewUserHistoryModalProps) => {
    const firestore = useFirestore();

    const { data: rides = [], isLoading, isError, error } = useQuery<Ride[]>({
        queryKey: ['userRides', user.id],
        queryFn: () => getUserRides(firestore, user.id),
        enabled: isOpen && !!firestore, // Only run query when modal is open
    });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ride History for {user.name}</DialogTitle>
          <DialogDescription>
            Showing all rides taken by this user.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full">
            <div className="py-4">
            {isLoading && <p className="text-center">Loading ride history...</p>}
            {isError && <p className="text-center text-destructive">Error: {error ? (error as Error).message : 'Could not fetch history'}</p>}
            {!isLoading && !isError && (
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Ride ID</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Fare</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rides.length > 0 ? rides.map(ride => (
                            <TableRow key={ride.id}>
                                <TableCell className="font-mono text-xs">{ride.id}</TableCell>
                                <TableCell>{ride.driverName}</TableCell>
                                <TableCell>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(ride.fare)}</TableCell>
                                <TableCell>{ride.status}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No rides found for this user.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
