export type VendorFee = {
  id: string;
  driverId: string;
  driverName: string;
  date: any; // Can be a Date object, Firebase Timestamp, or ISO string
  feeAmount: number;
  status: 'paid' | 'unpaid';
};
