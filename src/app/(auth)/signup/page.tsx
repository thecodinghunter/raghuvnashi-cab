
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Car, Phone } from 'lucide-react';

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-primary">Sign Up As</CardTitle>
        <CardDescription>
          How would you like to register?
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button size="lg" asChild className="w-full">
          <Link href="/signup/user">
            <User className="mr-2" />
            Sign up with Email
          </Link>
        </Button>
        <Button size="lg" asChild className="w-full" variant='outline'>
          <Link href="/signup/phone">
            <Phone className="mr-2" />
            Sign up with Phone
          </Link>
        </Button>
        <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or if you are a driver
                </span>
            </div>
        </div>
        <Button size="lg" asChild className="w-full" variant="secondary">
          <Link href="/signup/driver">
            <Car className="mr-2" />
            Driver Signup
          </Link>
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline text-accent">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
