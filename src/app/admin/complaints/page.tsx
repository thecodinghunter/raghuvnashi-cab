'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ComplaintsDataTable } from '@/components/admin/complaints/ComplaintsDataTable';
import { columns } from '@/components/admin/complaints/Columns';
import { useFirestore } from '@/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Complaint } from '@/lib/types';

async function getComplaints(firestore: any): Promise<Complaint[]> {
  const complaintsQuery = query(collection(firestore, 'complaints'));
  try {
    const querySnapshot = await getDocs(complaintsQuery);
    const complaints = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
      return { id: doc.id, ...data, createdAt } as Complaint;
    });
    return complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: 'complaints',
        operation: 'list',
      })
    );
    throw new Error('You do not have permission to list complaints.');
  }
}

export default function ComplaintsPage() {
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: complaints = [], isLoading, isError, error } = useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: () => getComplaints(firestore),
    enabled: !!firestore,
    retry: false,
  });

  const handleMarkAsResolved = async (complaintId: string) => {
    const complaintRef = doc(firestore, 'complaints', complaintId);
    try {
      await updateDoc(complaintRef, { status: 'Resolved' });
      toast({
        title: 'Complaint Resolved',
        description: 'The complaint has been marked as resolved. A notification has been sent to the user.',
      });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({
        path: complaintRef.path,
        operation: 'update',
        requestResourceData: { status: 'Resolved' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update complaint status.' });
    }
  };

  const memoizedColumns = useMemo(() => columns({ onMarkAsResolved: handleMarkAsResolved }), [firestore]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Support & Complaints</CardTitle>
          <CardDescription>
            Manage user complaints and support tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-center p-8">Loading complaints...</div>}
          {isError && <div className="p-8 text-center text-destructive">Error: {error.message}</div>}
          {!isLoading && !isError && <ComplaintsDataTable columns={memoizedColumns} data={complaints} />}
        </CardContent>
      </Card>
    </div>
  );
}
