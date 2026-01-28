# Admin Dashboard - Visual Guide

## 1. Admin Header (Desktop & Mobile)

### Desktop View
```
┌─────────────────────────────────────────────────────────────────────┐
│ ☰ Menu  Jalaram Cabs Admin              👤 John Doe (admin@jalaram.com) │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile View (Hamburger Menu Closed)
```
┌──────────────────────────────────────────┐
│ ☰  Jalaram Cabs Admin           👤 JD   │
└──────────────────────────────────────────┘
```

### Mobile View (Hamburger Menu Open)
```
┌──────────────────────────────────────────┐
│ ✕  Jalaram Cabs Admin           👤 JD   │
├──────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (Overlay Sidebar)  │
│ 📊 Dashboard                              │
│ 🚗 Rides                                  │
│ 👥 Drivers                                │
│ 👤 Users                                  │
│ ⚠️  Complaints                            │
│ ⚙️  Settings                              │
│ 🚪 Log Out                                │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                     │
└──────────────────────────────────────────┘
```

### Admin Profile Dropdown
```
┌─────────────────────────────────────┐
│ Click on avatar to open menu:       │
├─────────────────────────────────────┤
│ 👤 John Doe                         │
│    admin@jalaram.com                │
├─────────────────────────────────────┤
│ 🚪 Logout                           │
└─────────────────────────────────────┘
```

---

## 2. Platform Settings Page Layout

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ Platform Settings                                           │
│ Manage global platform configuration used across the app    │
└─────────────────────────────────────────────────────────────┘
```

### Maintenance Mode Alert (when enabled)
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Maintenance mode is currently enabled. Users will not    │
│    be able to access the app.                              │
└─────────────────────────────────────────────────────────────┘
```

### Settings Card
```
┌─────────────────────────────────────────────────────────────┐
│ 🎨 Fare & Revenue Settings                                  │
│    Configure pricing and revenue collection parameters     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Daily Vendor Fee (₹)                                         │
│ Fixed daily charge vendors must pay                         │
│ ┌──────────────┐                                             │
│ │   100        │                                             │
│ └──────────────┘                                             │
│                                                              │
│ Default Fare per KM (₹)                                      │
│ Used in fare calculation logic                              │
│ ┌──────────────┐                                             │
│ │   15         │                                             │
│ └──────────────┘                                             │
│                                                              │
│ Base Fare (₹)                                                │
│ Minimum ride charge                                         │
│ ┌──────────────┐                                             │
│ │   40         │                                             │
│ └──────────────┘                                             │
│                                                              │
│ Surge Multiplier                                            │
│ Used during peak hours (1x – 3x multiplier)                 │
│ ├─────────────────────────────────────┤  ┌──────┐           │
│ ●─────────────────────────────────────│  │ 1.5x │           │
│ ├─────────────────────────────────────┤  └──────┘           │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ System Settings                                             │
│                                                              │
│ Maintenance Mode                                            │
│ Temporarily disable app for maintenance                    │
│ ┌────────────────────────────────┐  ⚪ OFF  │                │
│                                                              │
│ Default Currency                                            │
│ ┌──────────────────┐                                         │
│ │ ₹ Indian Rupee   │ ▼                                       │
│ └──────────────────┘                                         │
│                                                              │
│ App Version (for force updates)                             │
│ Version number for mobile clients                           │
│ ┌──────────────┐                                             │
│ │   1.0.0      │                                             │
│ └──────────────┘                                             │
│ Format: major.minor.patch (e.g., 1.0.0)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Action Buttons
```
┌─────────────────────────────────────────────────────────────┐
│ 💾 Save Changes  [×] Cancel                                │
└─────────────────────────────────────────────────────────────┘
```

### Last Updated Info
```
┌─────────────────────────────────────────────────────────────┐
│ Last updated: Nov 13, 2025 2:30:45 PM                       │
│ By: admin@jalaram.com                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Sidebar Navigation (Desktop & Mobile)

### All Navigation Items
```
🔗 Navigation Links:

📊 Dashboard      ─→ /admin/dashboard
🚗 Rides          ─→ /admin/rides  
👥 Drivers        ─→ /admin/drivers
👤 Users          ─→ /admin/users
⚠️  Complaints    ─→ /admin/complaints
⚙️  Settings      ─→ /admin/settings  [NEW]
🚪 Log Out        ─→ /login
```

---

## 4. Component File Structure

```
AdminHeader (NEW)
├── Props:
│   ├── onMenuToggle: () => void
│   └── isSidebarOpen: boolean
├── Features:
│   ├── Hamburger menu (mobile only)
│   ├── Admin title
│   ├── Profile avatar with initials
│   ├── Admin name and email
│   └── Logout dropdown
└── Responsive:
    ├── Mobile: Full hamburger + avatar
    └── Desktop: Avatar + name + email visible

PlatformSettingsPage (NEW)
├── Form Inputs:
│   ├── Daily Vendor Fee (number)
│   ├── Default Fare per KM (number)
│   ├── Base Fare (number)
│   ├── Surge Multiplier (slider 1-3)
│   ├── Maintenance Mode (toggle)
│   ├── Default Currency (dropdown)
│   └── App Version (text)
├── Actions:
│   ├── Save Changes (glowing button)
│   ├── Cancel (outline button)
│   └── Real-time validation
├── Feedback:
│   ├── Success/error toasts
│   ├── Loading spinner
│   ├── Maintenance alert
│   └── Last updated info
└── Integration:
    ├── Firestore read/write
    ├── React Query caching
    └── Admin audit trail

AdminLayout (UPDATED)
├── State:
│   └── isSidebarOpen: boolean
├── Components:
│   ├── AdminHeader (new)
│   ├── Sidebar (mobile overlay + desktop fixed)
│   └── Main content area
└── Responsive:
    ├── Mobile: Header + hamburger menu
    └── Desktop: Header + fixed sidebar
```

---

## 5. Interactive Flow

### Accessing Settings Page

```
1. Login as admin
   ↓
2. Redirected to /admin/dashboard
   ↓
3. Click ⚙️ Settings in sidebar
   ↓
4. Settings page loads with current platform configuration
   ↓
5. Admin can modify any settings
   ↓
6. Click "Save Changes" button
   ↓
7. Settings saved to Firestore with audit trail
   ↓
8. Success toast appears: "Platform settings updated successfully"
```

### Mobile Menu Flow

```
1. On mobile device, view admin dashboard
   ↓
2. Click hamburger menu (☰) in header
   ↓
3. Semi-transparent overlay appears with sidebar
   ↓
4. Click any navigation link or outside overlay to close
   ↓
5. Navigate to selected page
```

### Maintenance Mode Toggle

```
1. Admin opens Settings page
   ↓
2. Finds "Maintenance Mode" toggle
   ↓
3. Clicks toggle to enable
   ↓
4. Red alert appears: "Maintenance mode is currently enabled"
   ↓
5. Clicks "Save Changes"
   ↓
6. Setting persisted to Firestore
   ↓
7. App checks maintenance flag on startup and shows maintenance page
```

---

## 6. Firestore Data Structure

### Collection: platformSettings
### Document: global

```json
{
  "dailyVendorFee": 100,
  "defaultFarePerKm": 15,
  "baseFare": 40,
  "surgeMultiplier": 1.5,
  "maintenanceMode": false,
  "defaultCurrency": "₹",
  "appVersion": "1.0.0",
  "updatedAt": Timestamp(2025-11-13T10:30:00Z),
  "updatedBy": "admin@jalaram.com"
}
```

---

## 7. Features Summary

✅ **Admin Header with Profile**
- Avatar with admin initials
- Admin name and email display
- Dropdown menu with logout
- Hamburger menu for mobile

✅ **Mobile-First Responsive Design**
- Hamburger menu toggle on mobile
- Overlay sidebar with backdrop
- Fixed sidebar on desktop
- Adaptive form layout

✅ **Platform Settings Management**
- 7 configurable settings
- Real-time form validation
- Save/cancel functionality
- Maintenance mode alert

✅ **Data Persistence**
- Firestore integration
- Audit trail (who changed what and when)
- React Query caching
- Error handling and retries

✅ **User Experience**
- Toast notifications
- Loading states
- Change detection
- Last updated information

---

## 8. Testing Instructions

### Mobile Testing
1. Open DevTools (F12) → Toggle device toolbar
2. Set viewport to mobile (e.g., iPhone 12)
3. Click hamburger menu (☰) to toggle sidebar
4. Verify overlay and backdrop appear
5. Click outside or on a link to close

### Settings Testing
1. Navigate to `/admin/settings`
2. Modify Daily Vendor Fee: Change to 150
3. Adjust Surge Multiplier using slider to 2.0x
4. Toggle Maintenance Mode ON
5. Click "Save Changes"
6. Verify toast: "Platform settings updated successfully"
7. Verify Last Updated info shows current timestamp
8. Refresh page and verify settings persist

### Mobile Menu Testing
1. On mobile device, click ☰ hamburger menu
2. Verify sidebar slides in from left
3. Verify semi-transparent backdrop appears
4. Click Settings from menu
5. Verify sidebar closes and page navigates
6. Verify settings page loads correctly on mobile

