// Platform settings types for Firestore
export interface PlatformSettings {
  id?: string;
  dailyVendorFee: number; // ₹
  defaultFarePerKm: number; // ₹
  baseFare: number; // ₹
  surgeMultiplier: number; // 1x - 3x (as multiplier value e.g., 1.5 = 1.5x)
  maintenanceMode: boolean;
  defaultCurrency: string; // "₹"
  appVersion: string; // e.g., "1.0.0"
  updatedAt?: Date;
  updatedBy?: string;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  dailyVendorFee: 100,
  defaultFarePerKm: 15,
  baseFare: 40,
  surgeMultiplier: 1,
  maintenanceMode: false,
  defaultCurrency: '₹',
  appVersion: '1.0.0',
};
