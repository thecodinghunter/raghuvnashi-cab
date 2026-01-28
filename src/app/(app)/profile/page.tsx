'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { CreditCard, Bell, User, Car } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { UserProfile } from '@/lib/types';
import { Switch } from '@/components/ui/switch';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
});

async function getUserProfile(firestore: any, userId: string): Promise<UserProfile | null> {
  const userDocRef = doc(firestore, 'users', userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'get' }));
    throw new Error('Failed to fetch user profile.');
  }
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userAvatar = getPlaceholderImage('user-avatar');

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => getUserProfile(firestore, user!.uid),
    enabled: !isUserLoading && !!user,
  });
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? user?.displayName ?? '',
      email: profile?.email ?? user?.email ?? '',
      phoneNumber: profile?.phoneNumber ?? user?.phoneNumber ?? '',
    },
    disabled: isLoading || isUserLoading
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
      // First, update the auth profile
      await updateProfile(user, { displayName: values.name });

      // Then, update the firestore document
      await updateDoc(userDocRef, {
        name: values.name,
        phoneNumber: values.phoneNumber,
      });

      toast({ title: 'Profile Updated', description: 'Your information has been saved.' });
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.uid] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.uid, 'short'] });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'update', requestResourceData: values }));
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your profile.' });
    }
  };

  const FallbackIcon = () => {
    if (profile?.role === 'driver') {
        return <Car className="h-8 w-8"/>
    }
    return <User className="h-8 w-8"/>
  }

  if (isLoading || isUserLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold font-headline mb-6 text-primary">
          Profile & Settings
        </h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-28" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
      return <div className="container py-8 text-center text-destructive">Error: {error.message}</div>
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold font-headline mb-6 text-primary">
        Profile & Settings
      </h1>
      <div className="grid gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    {userAvatar?.imageUrl && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                    <AvatarFallback className="text-2xl">
                      <FallbackIcon />
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">Change Photo</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Notifications Card */}
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                        <Bell className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates about new rides and account activity.</p>
                        </div>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-dashed p-4">
              <div className="flex items-center gap-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">Visa ending in 1234</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
            <Button variant="outline">Add New Payment Method</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
