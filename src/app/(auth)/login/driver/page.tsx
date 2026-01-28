
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function DriverLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // 1. Check if email is verified first
      if (!user.emailVerified) {
        throw new Error('Please verify your email address before logging in.');
      }

      // 2. Check user role and status in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        // We still throw an error to be caught by the outer try/catch block
        throw new Error('Could not verify driver status due to permissions.');
      });


      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'driver') {
          throw new Error('This account is not registered as a driver.');
        }
         // 3. Check account status
        if (userData.status === 'pending') {
          throw new Error('Your account is pending approval. Please wait for an admin to review it.');
        }
        if (userData.status === 'blocked') {
          throw new Error('Your account has been blocked. Please contact support.');
        }
        if (userData.status !== 'approved') {
            throw new Error(`Your account has an unknown status: ${userData.status}.`);
        }

      } else {
        throw new Error('Driver details not found. Your registration might still be processing.');
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back, driver!',
      });
      router.push('/live-map');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
      // Ensure user is signed out if any part of the login validation fails after initial auth
      if(auth.currentUser) {
        await auth.signOut();
      }
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          Driver Login
        </CardTitle>
        <CardDescription>
          Enter your email below to login to your driver account.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have a driver account?{' '}
              <Link href="/signup/driver" className="underline text-accent">
                Sign up
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/login" className="underline text-accent">
                Back to login options
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
