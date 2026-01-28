'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Driver } from '@/lib/types';

interface ViewKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
}

const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <h3 className="font-semibold text-sm text-muted-foreground">{label}</h3>
        <p className="font-mono text-base bg-secondary/50 p-2 rounded-md mt-1">{value || 'Not Provided'}</p>
    </div>
)

export const ViewKycModal = ({ isOpen, onClose, driver }: ViewKycModalProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>KYC Details for {driver.name}</DialogTitle>
          <DialogDescription>
            Review the driver's submitted document numbers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <DetailItem label="Aadhar Card Number" value={driver.aadharNumber} />
            <DetailItem label="Driving License Number" value={driver.licenseNumber} />
            <DetailItem label="Vehicle RC Number" value={driver.rcNumber} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
