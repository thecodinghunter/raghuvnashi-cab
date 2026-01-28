'use client';
import { useMemo } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UsersDataTable } from '@/components/admin/users/UsersDataTable';
import { columns } from '@/components/admin/users/Columns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Ride, UserProfile } from '@/lib/types';


async function getUsers(firestore: any): Promise<UserProfile[]> {
    const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'user'));
    const ridesQuery = query(collection(firestore, 'rides'));

    try {
        const [usersSnapshot, ridesSnapshot] = await Promise.all([
             getDocs(usersQuery),
             getDocs(ridesQuery)
        ]);

        const ridesByUser = new Map<string, number>();
        ridesSnapshot.docs.forEach(doc => {
            const ride = doc.data() as Ride;
            ridesByUser.set(ride.userId, (ridesByUser.get(ride.userId) || 0) + 1);
        });

        const users = usersSnapshot.docs.map(doc => {
            const user = { id: doc.id, ...doc.data() } as UserProfile;
            user.totalRides = ridesByUser.get(user.id) || 0;
            return user;
        });

        return users;

    } catch (error: any) {
         errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: 'users',
                operation: 'list',
            })
        );
        throw new Error('You do not have permission to list users.');
    }
}

export default function UsersPage() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading, isError, error } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => getUsers(firestore),
    enabled: !!firestore,
    retry: false,
  });

  const handleUpdateStatus = async (userId: string, status: 'active' | 'suspended') => {
    const userRef = doc(firestore, 'users', userId);
    try {
        await updateDoc(userRef, { status });
        toast({ title: `User has been ${status}.` });
        queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (e: any) {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { status }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update user status.'});
    }
  };

  const memoizedColumns = useMemo(() => columns({ onUpdateStatus: handleUpdateStatus }), [firestore]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="p-8 text-center">Loading users...</div>}
          {isError && <div className="p-8 text-center text-destructive">Error: {error.message}</div>}
          {!isLoading && !isError && <UsersDataTable columns={memoizedColumns} data={users} />}
        </CardContent>
      </Card>
    </div>
  );
}
