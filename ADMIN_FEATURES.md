# Admin Dashboard Features

## Overview
This document describes the new admin dashboard features including the hamburger menu, admin header, and platform settings configuration.

---

## Features Added

### 1. **Admin Header Component** (`src/components/admin/AdminHeader.tsx`)
A professional header for the admin panel with:

- **Hamburger Menu (Mobile)**: Toggle button to open/close sidebar on mobile devices
- **Admin Title**: "Jalaram Cabs Admin" brand display
- **Admin Profile Dropdown**:
  - Shows admin avatar with initials
  - Displays admin name and email
  - Logout option with confirmation
  - Mobile and desktop responsive design

**Key Props:**
- `onMenuToggle`: Callback to toggle sidebar visibility
- `isSidebarOpen`: Boolean state of sidebar visibility

---

### 2. **Enhanced Admin Layout** (`src/app/admin/layout.tsx`)
Updated layout with:

- **Header Integration**: AdminHeader component at the top
- **Mobile Sidebar**: Overlay sidebar for mobile devices
- **Desktop Sidebar**: Fixed sidebar for desktop (hidden on mobile)
- **Responsive Design**: Hamburger menu only on mobile, full sidebar on desktop
- **State Management**: Toggle state for sidebar visibility
- **Backdrop**: Semi-transparent backdrop when mobile sidebar is open

---

### 3. **Platform Settings Page** (`src/app/admin/settings/page.tsx`)
A comprehensive settings management interface with:

#### **Fare & Revenue Settings:**
- **Daily Vendor Fee (₹)**: Fixed daily charge vendors must pay
  - Input type: Number
  - Default: ₹100
  - Step: ₹10

- **Default Fare per KM (₹)**: Used in fare calculation logic
  - Input type: Number
  - Default: ₹15
  - Step: ₹1

- **Base Fare (₹)**: Minimum ride charge
  - Input type: Number
  - Default: ₹40
  - Step: ₹10

- **Surge Multiplier**: Used during peak hours
  - Input type: Slider (1x – 3x)
  - Range: 1.0 to 3.0
  - Step: 0.1
  - Real-time display of current multiplier

#### **System Settings:**
- **Maintenance Mode**: Temporarily disable app for maintenance
  - Input type: Toggle (on/off)
  - Alert shown when enabled
  - Prevents user app access when on

- **Default Currency**: Currency used throughout the app
  - Input type: Dropdown
  - Options: ₹ (INR), $ (USD), € (EUR)
  - Default: ₹

- **App Version**: Version number for mobile clients
  - Input type: Text input
  - Format: major.minor.patch (e.g., 1.0.0)
  - Used for force update logic

#### **Features:**
- **Real-time Validation**: Form state tracking for unsaved changes
- **Save/Cancel**: Buttons to save or discard changes
- **Loading State**: Spinner during save operation
- **Success/Error Toasts**: User feedback on save actions
- **Audit Trail**: Shows who updated settings and when
- **Maintenance Alert**: Red alert displayed when maintenance mode is enabled

---

### 4. **Platform Settings Types** (`src/lib/platform-settings.ts`)
TypeScript interfaces and types:

```typescript
interface PlatformSettings {
  id?: string;
  dailyVendorFee: number;
  defaultFarePerKm: number;
  baseFare: number;
  surgeMultiplier: number; // 1.0 - 3.0
  maintenanceMode: boolean;
  defaultCurrency: string;
  appVersion: string;
  updatedAt?: Date;
  updatedBy?: string;
}
```

**Default Settings:**
```typescript
{
  dailyVendorFee: 100,
  defaultFarePerKm: 15,
  baseFare: 40,
  surgeMultiplier: 1,
  maintenanceMode: false,
  defaultCurrency: '₹',
  appVersion: '1.0.0',
}
```

---

### 5. **Updated Sidebar** (`src/components/admin/Sidebar.tsx`)
Enhanced with:
- New **Settings** link with gear icon (⚙️)
- Routing to `/admin/settings`
- Proper active state highlighting

---

## Database Schema

### Firestore Collection: `platformSettings`

**Document ID:** `global`

**Document Structure:**
```json
{
  "dailyVendorFee": 100,
  "defaultFarePerKm": 15,
  "baseFare": 40,
  "surgeMultiplier": 1.5,
  "maintenanceMode": false,
  "defaultCurrency": "₹",
  "appVersion": "1.0.0",
  "updatedAt": "2025-11-13T10:30:00Z",
  "updatedBy": "admin@jalaram.com"
}
```

---

## Usage

### Accessing Admin Dashboard
1. Navigate to `/admin/dashboard` after login as admin
2. Click hamburger menu (☰) on mobile to open sidebar
3. Click Settings from sidebar to access platform configuration

### Updating Platform Settings
1. Go to Settings page (`/admin/settings`)
2. Modify desired settings using form inputs
3. Changes are marked immediately (red border on Save button when changes exist)
4. Click **Save Changes** to persist to Firestore
5. Success toast appears confirming update
6. Last updated info shows who modified and when

### Maintenance Mode
1. Toggle the **Maintenance Mode** switch in System Settings
2. When enabled:
   - Red alert appears
   - Users cannot access the app
   - Flag can be used in app to show maintenance page

---

## UI Components Used

- **Card**: Settings container with header and content
- **Button**: Save/Cancel actions
- **Input**: Text and number inputs for fees and fare
- **Label**: Form labels
- **Switch**: Toggle for maintenance mode
- **Slider**: Surge multiplier selection
- **Select**: Currency dropdown
- **Alert**: Maintenance mode warning
- **Avatar**: Admin profile picture
- **DropdownMenu**: Admin profile menu in header
- **Loader**: Loading spinner during save
- **Skeleton**: Loading state for initial data fetch

---

## Responsive Design

### Mobile (< 768px)
- Hamburger menu visible and functional
- Overlay sidebar with backdrop
- Full-width forms and buttons
- Stacked layout for settings card

### Desktop (≥ 768px)
- Fixed sidebar always visible
- Hamburger menu hidden
- Multi-column form layout
- Side-by-side admin profile display

---

## Integration Points

### Firebase Integration
- **Collection:** `platformSettings`
- **Document:** `global`
- **Operations:** 
  - Read on page load (React Query)
  - Write on settings save
  - Merge strategy for updates

### Authentication
- Admin name and email from `auth.currentUser`
- Stored in `updatedBy` field on each save
- Logout functionality in header dropdown

### State Management
- React Query for data fetching and caching
- Local React state for form changes
- Optimistic UI updates with revert on error

---

## Error Handling

- **Network Errors**: Toast notification with retry option
- **Permission Errors**: Display permission denied message
- **Validation**: Client-side validation on form inputs
- **Save Failures**: Detailed error messages and recovery steps

---

## Future Enhancements

- [ ] Settings versioning and rollback capability
- [ ] Real-time sync across multiple admins
- [ ] Settings audit log with full history
- [ ] Scheduled settings changes (e.g., surge pricing at specific times)
- [ ] Settings templates for different cities/regions
- [ ] Rate limiting configuration
- [ ] Push notification settings
- [ ] Email notification preferences

---

## File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx (UPDATED)
│       └── settings/
│           └── page.tsx (NEW)
├── components/
│   └── admin/
│       ├── AdminHeader.tsx (NEW)
│       ├── Sidebar.tsx (UPDATED)
│       └── ...
└── lib/
    └── platform-settings.ts (NEW)
```

---

## Testing Checklist

- [x] Admin header displays correctly on mobile and desktop
- [x] Hamburger menu toggles sidebar on mobile
- [x] Admin profile dropdown works
- [x] Logout functionality works
- [x] Settings page loads with default values
- [x] Form inputs can be modified
- [x] Slider works for surge multiplier
- [x] Toggle works for maintenance mode
- [x] Save button disabled when no changes
- [x] Save button enabled when changes made
- [x] Settings save to Firestore
- [x] Toast notifications appear on success/error
- [x] Last updated info displays
- [x] Mobile responsive layout works
- [x] Desktop layout works

