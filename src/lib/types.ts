

export type Ride = {
  id: string;
  userId: string;
  userName: string;
  driverId: string | null;
  driverName: string;
  pickup: string;
  dropoff: string;
  pickupCoords: { lat: number, lon: number };
  dropoffCoords: { lat: number, lon: number };
  fare: number;
  status: "Requested" | "Accepted" | "In Progress" | "Completed" | "Cancelled" | "Disputed";
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  vehicleType: string;
  otp?: number;
  acceptedAt?: string;
  rideStartedAt?: string;
  completedAt?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'user' | 'driver' | 'admin';
  status?: 'active' | 'suspended' | 'pending' | 'approved' | 'blocked';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  totalRides?: number;
  vehicleType?: string;
  plateNumber?: string;
};

export type Driver = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  plateNumber: string;
  aadharNumber?: string;
  licenseNumber?: string;
  rcNumber?: string;
  status: 'pending' | 'approved' | 'blocked';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  feeStatus?: 'paid' | 'unpaid';
  feeId?: string;
};

export type Complaint = {
  id: string;
  userId: string;
  userName: string;
  rideId: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: Date;
};

export type Location = {
  name: string;
  coords: {
    latitude: number;
    longitude: number;
  };
};
