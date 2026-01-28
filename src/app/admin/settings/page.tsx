'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth, useStorage } from '@/firebase';
import { uploadFile } from '@/lib/storage';
import Image from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  limit,
} from 'firebase/firestore';
import {
  PlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from '@/lib/platform-settings';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PlatformSettingsPage = () => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const storage = useStorage();
  const [settings, setSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current settings
  const { isLoading, refetch } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      if (!firestore) return DEFAULT_PLATFORM_SETTINGS;

      try {
        const q = query(
          collection(firestore, 'platformSettings'),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const raw = snapshot.docs[0].data() as Partial<PlatformSettings>;
          const data: PlatformSettings = {
            ...DEFAULT_PLATFORM_SETTINGS,
            ...(raw as PlatformSettings),
            dailyVendorFee: Number((raw as any).dailyVendorFee) || DEFAULT_PLATFORM_SETTINGS.dailyVendorFee,
            defaultFarePerKm: Number((raw as any).defaultFarePerKm) || DEFAULT_PLATFORM_SETTINGS.defaultFarePerKm,
            baseFare: Number((raw as any).baseFare) || DEFAULT_PLATFORM_SETTINGS.baseFare,
            surgeMultiplier: Number((raw as any).surgeMultiplier) || DEFAULT_PLATFORM_SETTINGS.surgeMultiplier,
            maintenanceMode: typeof raw.maintenanceMode === 'boolean' ? raw.maintenanceMode : DEFAULT_PLATFORM_SETTINGS.maintenanceMode,
            defaultCurrency: raw.defaultCurrency || DEFAULT_PLATFORM_SETTINGS.defaultCurrency,
            appVersion: raw.appVersion || DEFAULT_PLATFORM_SETTINGS.appVersion,
            appName: raw.appName || DEFAULT_PLATFORM_SETTINGS.appName,
            appLogoUrl: raw.appLogoUrl || DEFAULT_PLATFORM_SETTINGS.appLogoUrl,
          };
          setSettings(data);
          return data;
        }

        // If no settings exist, initialize with defaults
        return DEFAULT_PLATFORM_SETTINGS;
      } catch (error: any) {
        console.error('Error fetching settings:', error);
        // Do not throw error to avoid crashing the app.
        // Just return defaults and maybe show a toast/alert if needed.
        if (error?.code === 'permission-denied') {
          console.warn("Permission denied fetching platform settings. Using defaults.");
        }
        return DEFAULT_PLATFORM_SETTINGS;
      }
    },
    enabled: !!firestore,
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: PlatformSettings) => {
      if (!firestore || !auth?.currentUser) {
        throw new Error('Firebase not initialized');
      }

      const settingsRef = doc(firestore, 'platformSettings', 'global');
      // Normalize numeric fields before saving to avoid accidental NaN/undefined
      const normalized: PlatformSettings = {
        ...updatedSettings,
        dailyVendorFee: Number(updatedSettings.dailyVendorFee) || 0,
        defaultFarePerKm: Number(updatedSettings.defaultFarePerKm) || 0,
        baseFare: Number(updatedSettings.baseFare) || 0,
        surgeMultiplier:
          typeof updatedSettings.surgeMultiplier === 'number'
            ? updatedSettings.surgeMultiplier
            : Number(updatedSettings.surgeMultiplier) || 1,
        maintenanceMode: Boolean(updatedSettings.maintenanceMode),
        defaultCurrency: updatedSettings.defaultCurrency || DEFAULT_PLATFORM_SETTINGS.defaultCurrency,
        appVersion: updatedSettings.appVersion || DEFAULT_PLATFORM_SETTINGS.appVersion,
        appName: updatedSettings.appName || DEFAULT_PLATFORM_SETTINGS.appName,
        appLogoUrl: updatedSettings.appLogoUrl || DEFAULT_PLATFORM_SETTINGS.appLogoUrl,
      };

      const dataToSave = {
        ...normalized,
        updatedAt: new Date(),
        updatedBy: auth.currentUser.displayName || auth.currentUser.email,
      };

      try {
        await setDoc(settingsRef, dataToSave, { merge: true });
        return dataToSave;
      } catch (error: any) {
        console.error('Error saving settings:', error);
        if (error?.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({ path: 'platformSettings', operation: 'write', requestResourceData: dataToSave })
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Platform settings updated successfully.',
      });
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettingsMutation.mutateAsync(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    // Guard numeric fields to avoid NaN -> Firestore storing 0
    const numericFields: Array<keyof PlatformSettings> = [
      'dailyVendorFee',
      'defaultFarePerKm',
      'baseFare',
      'surgeMultiplier',
    ];

    setSettings((prev) => ({
      ...prev,
      [field]: numericFields.includes(field as any) ? (isNaN(Number(value)) ? 0 : Number(value)) : value,
    }));
    setHasChanges(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !storage) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const path = `app-assets/logo-${Date.now()}-${file.name}`;
      const downloadURL = await uploadFile(storage, file, path);

      setSettings(prev => ({ ...prev, appLogoUrl: downloadURL }));
      setHasChanges(true);
      toast({
        title: 'Logo Uploaded',
        description: 'App logo uploaded successfully. Don\'t forget to save changes.',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
          <p className="text-muted-foreground">
            Manage global platform configuration used across the Jalaram Cabs
            application.
          </p>
        </div>

        {/* Maintenance Mode Alert */}
        {settings.maintenanceMode && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Maintenance mode is currently enabled. Users will not be able to
              access the app.
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Grid (smaller cards) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* App Identity Card */}
          <Card className="border shadow-sm md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle>App Identity</CardTitle>
              <CardDescription>Customize the application name and logo</CardDescription>
            </CardHeader>
            <CardContent className="p-4 grid gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="appName" className="text-base font-semibold">
                  App Name
                </Label>
                <Input
                  id="appName"
                  type="text"
                  value={settings.appName || ''}
                  onChange={(e) => handleInputChange('appName', e.target.value)}
                  placeholder="Jalaram Cabs"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-base font-semibold">App Logo</Label>
                <div className="flex items-center gap-4">
                  {settings.appLogoUrl ? (
                    <div className="relative h-16 w-16 border rounded-lg overflow-hidden bg-white">
                      <Image
                        src={settings.appLogoUrl}
                        alt="App Logo"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 border rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs text-center p-1">
                      No Logo
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="appLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 512x512px PNG or JPG
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle>Vendor Fee</CardTitle>
              <CardDescription>Vendor related charges</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3">
                <Label htmlFor="dailyVendorFee" className="text-base font-semibold">
                  Daily Vendor Fee (₹)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Fixed daily charge vendors must pay
                </p>
                <Input
                  id="dailyVendorFee"
                  type="number"
                  min="0"
                  step="10"
                  value={settings.dailyVendorFee}
                  onChange={(e) =>
                    handleInputChange('dailyVendorFee', parseFloat(e.target.value))
                  }
                  className="w-full md:w-48"
                  placeholder="100"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
                <div>
                  <Label className="text-base font-semibold">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">Temporarily disable app for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="defaultCurrency" className="text-base font-semibold">Default Currency</Label>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(value) => handleInputChange('defaultCurrency', value)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹">₹ Indian Rupee (INR)</SelectItem>
                    <SelectItem value="$">$ US Dollar (USD)</SelectItem>
                    <SelectItem value="€">€ Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* App Version */}
              <div className="grid gap-3">
                <Label htmlFor="appVersion" className="text-base font-semibold">
                  App Version (for force updates)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Version number for mobile clients
                </p>
                <Input
                  id="appVersion"
                  type="text"
                  value={settings.appVersion}
                  onChange={(e) =>
                    handleInputChange('appVersion', e.target.value)
                  }
                  className="w-full md:w-48"
                  placeholder="1.0.0"
                  pattern="^\d+\.\d+\.\d+$"
                />
                <p className="text-xs text-muted-foreground">
                  Format: major.minor.patch (e.g., 1.0.0)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="lg"
            className="gap-2 shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              setHasChanges(false);
            }}
            disabled={!hasChanges || isSaving}
            size="lg"
          >
            Cancel
          </Button>
        </div>

        {/* Last Updated Info */}
        {settings.updatedAt && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p>
              Last updated:{' '}
              <span className="font-medium">
                {new Date(settings.updatedAt as any).toLocaleString()}
              </span>
            </p>
            {settings.updatedBy && (
              <p>
                By: <span className="font-medium">{settings.updatedBy}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformSettingsPage;
