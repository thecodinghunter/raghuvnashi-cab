import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Car, Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-primary">Login As</CardTitle>
        <CardDescription>
          Are you a user or a driver?
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button size="lg" asChild className="w-full">
          <Link href="/login/user">
            <User className="mr-2" />
            User
          </Link>
        </Button>
        <Button size="lg" asChild className="w-full" variant="secondary">
          <Link href="/login/driver">
            <Car className="mr-2" />
            Driver
          </Link>
        </Button>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline text-accent">
            Sign up
          </Link>
        </div>
         <div className="text-center text-sm">
          <Link href="/login/admin" className="text-xs text-muted-foreground underline">
            Admin Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
