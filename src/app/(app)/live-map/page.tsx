
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Ride } from '@/lib/types';
import RideRequestModal from '@/components/live-map/RideRequestModal';
import RideInProgress from '@/components/live-map/RideInProgress';
import OtpVerification from '@/components/live-map/OtpVerification';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useDriverStatus } from '@/hooks/use-driver-status';
import StatusToggle from '@/components/dashboard/StatusToggle';
import { Card } from '@/components/ui/card';
import L from 'leaflet';
import { getDistance } from '@/lib/utils';

const LiveMap = dynamic(() => import('@/components/live-map/LiveMap'), {
  ssr: false,
});

export default function LiveMapPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const {
    isOnline,
    driverPosition,
    canGoOnline,
    setCanGoOnline,
    handleToggleOnline,
    onlineSince,
  } = useDriverStatus();

  const [isClient, setIsClient] = useState(false);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [rejectedRideIds, setRejectedRideIds] = useState<string[]>([]);
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setCanGoOnline(true);
    }
  }, [setCanGoOnline]);

  // === Rides already assigned to this driver ===
  const assignedRidesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'rides'),
      where('driverId', '==', user.uid),
      where('status', 'in', ['Accepted', 'In Progress'])
    );
  }, [firestore, user]);

  const { data: assignedRides } = useCollection<Ride>(assignedRidesQuery);

  // === Available rides for drivers ===
  const requestedRidesQuery = useMemoFirebase(() => {
    if (!firestore || !isOnline) return null;
    return query(
      collection(firestore, 'rides'),
      where('status', '==', 'Requested')
    );
  }, [firestore, isOnline]);

  const { data: allRequestedRides } = useCollection<Ride>(requestedRidesQuery);

  // === Client-side time and distance filtering ===
  const ridesWithDistance = useMemo(() => {
    if (!driverPosition || !allRequestedRides || !onlineSince) return [];

    const recentRides = allRequestedRides.filter(ride => {
        const rideDate = ride.createdAt instanceof Timestamp ? ride.createdAt.toDate() : new Date(ride.createdAt as any);
        return rideDate >= onlineSince;
    });

    return recentRides
      .map((ride) => {
        if (
          !ride.pickupCoords ||
          typeof ride.pickupCoords.lat === 'undefined' ||
          typeof ride.pickupCoords.lon === 'undefined'
        ) {
          return null;
        }
        const driverCoord = {
          latitude: Array.isArray(driverPosition)
            ? driverPosition[0]
            : driverPosition.lat,
          longitude: Array.isArray(driverPosition)
            ? driverPosition[1]
            : driverPosition.lng,
        };
        const pickupForDist = {
          latitude: ride.pickupCoords.lat,
          longitude: ride.pickupCoords.lon,
        };
        const distance = getDistance(driverCoord, pickupForDist);
        return { ...ride, distance };
      })
      .filter(
        (ride): ride is Ride & { distance: number } =>
          ride !== null && ride.distance < 20
      );
  }, [driverPosition, allRequestedRides, onlineSince]);

  const nearbyRideRequests = useMemo(() => {
    return ridesWithDistance
      .filter((ride) => !rejectedRideIds.includes(ride.id))
      .sort((a, b) => a.distance - b.distance);
  }, [ridesWithDistance, rejectedRideIds]);

  const rideToDisplay = nearbyRideRequests[currentRequestIndex] || null;

  useEffect(() => {
    if (
      nearbyRideRequests.length > 0 &&
      !nearbyRideRequests.find((r) => r.id === rideToDisplay?.id)
    ) {
      setCurrentRequestIndex(0);
    }
  }, [nearbyRideRequests, rideToDisplay]);

  // Determine the active ride in progress or accepted
  const rideInProgress = useMemo(() => {
    const ride = activeRide ?? (assignedRides ? assignedRides[0] : null);
    if(ride && (ride.status === 'In Progress' || ride.status === 'Accepted')) {
        return ride;
    }
    return null;
  }, [activeRide, assignedRides]);
  const showRequestModal = !rideInProgress && rideToDisplay;

  // === Accept Ride ===
  const handleAcceptRide = async (ride: Ride) => {
    if (!user || !firestore) return;
    const rideRef = doc(firestore, 'rides', ride.id);
    const driverRef = doc(firestore, 'users', user.uid);
    const driverName =
      user.displayName || user.email || `Driver #${user.uid.substring(0, 4)}`;
    
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    try {
      await runTransaction(firestore, async (transaction) => {
        // Read the driver's doc to include it in the transaction for rule validation
        transaction.get(driverRef);

        const rideDoc = await transaction.get(rideRef);
        if (!rideDoc.exists()) throw new Error('Ride no longer exists.');

        const data = rideDoc.data();
        if (data.status !== 'Requested')
          throw new Error('Ride already taken by another driver.');

        transaction.update(rideRef, {
          status: 'Accepted',
          driverId: user.uid,
          driverName,
          acceptedAt: serverTimestamp(),
          otp,
        });
      });

      toast({
        title: 'Ride Accepted!',
        description: 'You are now heading to the pickup location.',
      });

      setActiveRide({
        ...ride,
        status: 'Accepted',
        driverId: user.uid,
        driverName,
        otp,
      });
    } catch (e: any) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: rideRef.path,
          operation: 'update',
          requestResourceData: { status: 'Accepted', driverId: user.uid, driverName, otp },
        })
      );
      toast({
        variant: 'destructive',
        title: 'Could Not Accept Ride',
        description: e.message || 'The ride may have been taken by another driver.',
      });
      setRejectedRideIds((prev) => [...prev, ride.id]);
    }
  };

  // === Verify OTP and Start Ride ===
  const handleVerifyOtp = async (ride: Ride, enteredOtp: string) => {
    if (!firestore) return;
    const rideRef = doc(firestore, 'rides', ride.id);

    if (ride.otp?.toString() !== enteredOtp) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'The entered OTP is incorrect. Please try again.',
      });
      return;
    }

    try {
      await updateDoc(rideRef, { status: 'In Progress', rideStartedAt: serverTimestamp() });
      toast({
        title: 'Ride Started!',
        description: 'You are now heading to the drop-off location.',
      });
      setActiveRide(prev => prev ? { ...prev, status: 'In Progress' } : null);
    } catch (e: any) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: rideRef.path,
          operation: 'update',
          requestResourceData: { status: 'In Progress' },
        })
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not start the ride.',
      });
    }
  };


  // === End Ride ===
  const handleEndRide = async (ride: Ride) => {
    if (!firestore) return;
    const rideRef = doc(firestore, 'rides', ride.id);

    try {
      await updateDoc(rideRef, { status: 'Completed', completedAt: serverTimestamp() });
      toast({
        title: 'Ride Completed!',
        description: 'Fare has been processed.',
      });
      setActiveRide(null);
      setCurrentRequestIndex(0);
      setRejectedRideIds([]);
    } catch (e: any) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: rideRef.path,
          operation: 'update',
          requestResourceData: { status: 'Completed' },
        })
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not end ride.',
      });
    }
  };

  const handleRejectOrTimeout = (rideId: string) => {
    if (currentRequestIndex < nearbyRideRequests.length - 1) {
      setCurrentRequestIndex(currentRequestIndex + 1);
    } else {
      setRejectedRideIds((prev) => [...prev, rideId]);
      setCurrentRequestIndex(0);
    }
    toast({
      title: 'Ride Ignored',
      description: 'Searching for the next available ride.',
    });
  };

  const renderRideStateComponent = () => {
    if (!rideInProgress) return null;

    if (rideInProgress.status === 'Accepted') {
      return <OtpVerification ride={rideInProgress} onVerifyOtp={handleVerifyOtp} />
    }

    if (rideInProgress.status === 'In Progress') {
      return <RideInProgress ride={rideInProgress} onEndRide={handleEndRide} />
    }

    return null;
  }

  // === RENDER ===
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-4 right-4 z-[51] p-2 bg-background/80 backdrop-blur-sm rounded-lg border shadow-lg">
        <StatusToggle
          isOnline={isOnline}
          onToggle={handleToggleOnline}
          disabled={!isClient || !canGoOnline}
        />
      </div>

      <LiveMap
        driverPosition={driverPosition}
        pickup={
          rideInProgress?.pickupCoords
            ? {
                lat: rideInProgress.pickupCoords.lat,
                lon: rideInProgress.pickupCoords.lon,
                display_name: rideInProgress.pickup,
              }
            : null
        }
        drop={
          rideInProgress?.dropoffCoords
            ? {
                lat: rideInProgress.dropoffCoords.lat,
                lon: rideInProgress.dropoffCoords.lon,
                display_name: rideInProgress.dropoff,
              }
            : null
        }
      />

      {isOnline && !showRequestModal && !rideInProgress && (
        <Card className="absolute bottom-4 left-4 right-4 z-10 p-4 max-w-2xl mx-auto bg-background/80 backdrop-blur-xl border-primary shadow-lg">
          <div className="text-center">
            <p className="font-semibold text-lg">Searching for Rides...</p>
            <p className="text-muted-foreground">
              {ridesWithDistance.length > 0
                ? `${nearbyRideRequests.length} rides available in your area.`
                : 'Your location is being shared live. You will be notified of new ride requests.'}
            </p>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {renderRideStateComponent()}
      </AnimatePresence>
      
      <AnimatePresence>
        {showRequestModal && rideToDisplay && (
          <RideRequestModal
            key={rideToDisplay.id}
            ride={rideToDisplay}
            onAccept={handleAcceptRide}
            onReject={handleRejectOrTimeout}
            onTimeout={handleRejectOrTimeout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
