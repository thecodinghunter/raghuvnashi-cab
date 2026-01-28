"use client";
// Helper to convert Firestore Timestamp or {seconds, nanoseconds} to Date
function toDateSafe(val: any): Date {
    if (!val) return new Date(NaN);
    if (val instanceof Date) return val;
    if (typeof val.toDate === 'function') return val.toDate();
    if (typeof val.seconds === 'number' && typeof val.nanoseconds === 'number') {
        return new Date(val.seconds * 1000 + Math.floor(val.nanoseconds / 1e6));
    }
    return new Date(val);
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import type { Ride } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

interface RideDetailModalProps {
  ride: Ride | null;
  onClose: () => void;
}

const RideDetailModal = ({ ride, onClose }: RideDetailModalProps) => {
    const mapImage = getPlaceholderImage('map-background');

  if (!ride) return null;

  return (
    <Dialog open={!!ride} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-2xl p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <DialogHeader className="p-6 pb-4">
                <DialogTitle>Ride Details</DialogTitle>
                <DialogDescription>
                    A summary of the ride from {toDateSafe(ride.createdAt).toLocaleString()}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-muted-foreground text-sm">User</h3>
                        <p>{ride.userName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-muted-foreground text-sm">Pickup</h3>
                        <p>{ride.pickup}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-muted-foreground text-sm">Dropoff</h3>
                        <p>{ride.dropoff}</p>
                    </div>
                    <Separator/>
                    <div>
                        <h3 className="font-semibold text-muted-foreground text-sm">Fare</h3>
                        <p className="font-bold text-primary text-lg">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(ride.fare)}
                        </p>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-muted-foreground text-sm text-center">Route Map</h3>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                        {mapImage && (
                            <Image 
                                src={mapImage.imageUrl} 
                                alt="Ride route map" 
                                fill 
                                className="object-cover"
                                data-ai-hint={mapImage.imageHint}
                            />
                        )}
                    </div>
                </div>
            </div>
           </motion.div>
        </DialogContent>
    </Dialog>
  );
};

export default RideDetailModal;
