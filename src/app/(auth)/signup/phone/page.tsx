
'use client';

import { useEffect, useState } from 'react';
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
import { useAuth } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number including country code.' }),
});

export default function PhoneSignupPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  useEffect(() => {
    if (!auth || (window as any).recaptchaVerifier) return;
    
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': (response: any) => {
        setIsRecaptchaVerified(true);
      },
      'expired-callback': () => {
        setIsRecaptchaVerified(false);
      }
    });

    (window as any).recaptchaVerifier.render();

  }, [auth]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  const handleSendOtp = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const recaptchaVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, values.phoneNumber, recaptchaVerifier);
      
      (window as any).confirmationResult = confirmationResult;

      toast({
        title: 'OTP Sent',
        description: 'An OTP has been sent to your phone number.',
      });
      router.push(`/signup/otp?phoneNumber=${encodeURIComponent(values.phoneNumber)}&name=${encodeURIComponent(values.name)}`);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'Please ensure your Firebase project is on the Blaze plan and the Phone Sign-In provider is fully enabled.',
      });
      setIsRecaptchaVerified(false);
       if ((window as any).grecaptcha) {
        (window as any).grecaptcha.reset();
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          Sign Up with Phone
        </CardTitle>
        <CardDescription>
          Enter your name and phone number to receive an OTP.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSendOtp)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Jalaram Patel"
                      {...field}
                    />
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
                    <Input
                      type="tel"
                      placeholder="+91 12345 67890"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div id="recaptcha-container" className="flex justify-center"></div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !isRecaptchaVerified}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </Button>
            
            <div className="text-center text-sm">
              <Link href="/signup" className="underline text-accent">
                Back to signup options
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
