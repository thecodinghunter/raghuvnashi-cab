
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { Ride } from '@/lib/types';
import { motion } from 'framer-motion';

interface OtpVerificationProps {
  ride: Ride;
  onVerifyOtp: (ride: Ride, otp: string) => void;
}

const OtpVerification = ({ ride, onVerifyOtp }: OtpVerificationProps) => {
    const [otp, setOtp] = useState('');

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 4) {
            setOtp(value);
        }
    };
    
    const handleSubmit = () => {
        if(otp.length === 4) {
            onVerifyOtp(ride, otp);
        }
    }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute bottom-0 left-0 right-0 z-10 p-4"
    >
      <Card className="w-full max-w-2xl mx-auto bg-background/80 backdrop-blur-xl border-t-2 border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-accent flex items-center gap-2">
            <KeyRound />
            Verify OTP to Start Ride
          </CardTitle>
          <CardDescription>
            Ask the rider for their 4-digit OTP to begin the journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="tel"
              value={otp}
              onChange={handleOtpChange}
              maxLength={4}
              placeholder="1234"
              className="text-2xl text-center font-bold tracking-[0.5em] h-16"
            />
          </div>
          <Button
            size="lg"
            className="w-full text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 neon-accent"
            onClick={handleSubmit}
            disabled={otp.length !== 4}
          >
            <ShieldCheck className="mr-3" /> Start Ride
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OtpVerification;
