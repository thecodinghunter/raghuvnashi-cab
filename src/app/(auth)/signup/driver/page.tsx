
'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from '@/components/auth/ProgressIndicator';

const personalDetailsSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const vehicleDetailsSchema = z.object({
    vehicleType: z.enum(['Sedan', 'SUV', 'Luxury', 'Hatchback', 'Minivan'], { required_error: 'Please select a vehicle type.'}),
    plateNumber: z.string().min(3, { message: 'Please enter a valid plate number.' }),
});

const kycSchema = z.object({
    aadharNumber: z.string().min(12, { message: "Please enter a valid 12-digit Aadhar number." }).max(12),
    licenseNumber: z.string().min(1, { message: "Driving license number is required." }),
    rcNumber: z.string().min(1, { message: "Vehicle RC number is required." }),
});


const formSchema = personalDetailsSchema.merge(vehicleDetailsSchema).merge(kycSchema);

type FormValues = z.infer<typeof formSchema>;

const steps = [
    { id: 1, title: 'Personal Details', fields: ['name', 'email', 'phoneNumber', 'password'] as const },
    { id: 2, title: 'Vehicle Information', fields: ['vehicleType', 'plateNumber'] as const },
    { id: 3, title: 'Document Numbers', fields: ['aadharNumber', 'licenseNumber', 'rcNumber'] as const },
]


export default function DriverSignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      plateNumber: '',
      aadharNumber: '',
      licenseNumber: '',
      rcNumber: '',
    },
  });

  const { trigger } = form;

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await trigger(fields, { shouldFocus: true });
    if (!isValid) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleRegister = async (values: FormValues) => {
     setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });
      await sendEmailVerification(user);
      
      const newUserProfile = {
        id: user.uid,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: 'driver',
        vehicleType: values.vehicleType,
        plateNumber: values.plateNumber,
        aadharNumber: values.aadharNumber,
        licenseNumber: values.licenseNumber,
        rcNumber: values.rcNumber,
        createdAt: serverTimestamp(),
        isEmailVerified: false,
        status: 'pending',
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
        title: 'Registration Submitted',
        description: 'Your application is under review. Please check your email to verify your account.',
        duration: 5000,
      });
      router.push('/login/driver');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <CardHeader>
            <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl font-headline text-primary">
                Driver Sign Up
                </CardTitle>
                <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />
            </div>
            <CardDescription>
                {steps[currentStep].title}
            </CardDescription>
        </CardHeader>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRegister)}>
            <CardContent className="overflow-hidden relative h-[24rem]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute w-full space-y-4 pr-12"
                >
                    {currentStep === 0 && (
                        <>
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jalaram Patel" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+1 123 456 7890" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </>
                    )}
                     {currentStep === 1 && (
                        <>
                            <FormField control={form.control} name="vehicleType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a vehicle type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sedan">Sedan</SelectItem>
                                            <SelectItem value="SUV">SUV</SelectItem>
                                            <SelectItem value="Luxury">Luxury</SelectItem>
                                            <SelectItem value="Hatchback">Hatchback</SelectItem>
                                            <SelectItem value="Minivan">Minivan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="plateNumber" render={({ field }) => (
                                <FormItem><FormLabel>Vehicle Plate Number</FormLabel><FormControl><Input placeholder="MH 01 AB 1234" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                                <FormItem><FormLabel>Aadhar Card Number</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                                <FormItem><FormLabel>Driving License Number</FormLabel><FormControl><Input placeholder="e.g., DL1420110012345" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="rcNumber" render={({ field }) => (
                                <FormItem><FormLabel>Vehicle RC Number</FormLabel><FormControl><Input placeholder="Vehicle Registration Certificate Number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login/driver" className="underline text-accent hover:text-accent/80 transition-colors">
                        Login
                    </Link>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={prevStep} className={cn("transition-opacity", currentStep === 0 && "opacity-0 invisible")}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  {currentStep < steps.length - 1 && (
                    <Button type="button" onClick={nextStep} className="neon-primary">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90 neon-accent">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
