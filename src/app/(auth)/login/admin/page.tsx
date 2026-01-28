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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'admin@jalaramcabs.app',
      password: 'password123',
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      if (values.email !== 'admin@jalaramcabs.app') {
        throw new Error("This login is for administrators only.");
      }

      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome, Administrator!',
      });
      router.push('/admin/dashboard');

    } catch (error: any) {
       let description = error.message;
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            description = "Admin account not found. Please sign up as a regular user with the email 'admin@jalaramcabs.app' and password 'password123' first, then try logging in again.";
        }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });

      // If there's an error, ensure we are logged out to avoid partial auth state
      if (auth.currentUser) {
        await auth.signOut();
      }
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          Admin Login
        </CardTitle>
        <CardDescription>
          Enter your administrator credentials below.
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
                    <Input placeholder="admin@jalaramcabs.app" {...field} />
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
