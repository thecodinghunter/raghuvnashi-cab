'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </p>
      <div className="flex space-x-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              'h-2 w-2 rounded-full',
              index <= currentStep ? 'bg-primary' : 'bg-muted'
            )}
            animate={{ scale: index === currentStep ? 1.5 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};
