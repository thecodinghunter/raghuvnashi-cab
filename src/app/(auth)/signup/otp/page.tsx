
'use client';

import { Suspense } from 'react';
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
import { useFirestore, useUser } from '@/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  otp: z.string().min(6, { message: 'Please enter the 6-digit OTP.' }).max(6),
});

function OTPSignupForm() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phoneNumber');
  const name = searchParams.get('name'); // Name is passed from the previous step

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleVerifyOtp = async (values: z.infer<typeof formSchema>) => {
    try {
      const confirmationResult = (window as any).confirmationResult;
      if (!confirmationResult) {
        throw new Error("Could not verify OTP. Please try sending it again.");
      }

      const userCredential = await confirmationResult.confirm(values.otp);
      const user = userCredential.user;

      if (!name) {
          throw new Error("User name was not provided.");
      }

      const newUserProfile = {
        id: user.uid,
        name: name,
        phoneNumber: phoneNumber,
        role: 'user',
        createdAt: serverTimestamp(),
        isEmailVerified: true, // Phone verification acts as verification
        status: 'active'
      };
      
      const userDocRef = doc(firestore, 'users', user.uid);

      await setDoc(userDocRef, newUserProfile)
        .catch((error) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: newUserProfile,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw new Error('Could not save user profile due to permissions.');
        });

      toast({
        title: 'Registration Successful',
        description: 'You have been successfully registered!',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          Verify OTP
        </CardTitle>
        <CardDescription>
          Enter the OTP sent to {phoneNumber}.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleVerifyOtp)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="123456"
                      {...field}
                    />
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
              {form.formState.isSubmitting ? 'Verifying...' : 'Verify & Register'}
            </Button>
            <div className="text-center text-sm">
              Didn't receive a code?{' '}
              <Link href="/signup/user" className="underline text-accent">
                Resend
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


export default function OTPSignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OTPSignupForm />
        </Suspense>
    )
}
