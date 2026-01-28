# 🎛️ Admin Dashboard - Quick Reference Card

## 📍 Where to Find Things

### Admin Header
- **Location:** Top of every admin page
- **Components:**
  - Hamburger Menu (☰) - Mobile only
  - "Jalaram Cabs Admin" title
  - Admin Profile Avatar
  - Profile Dropdown Menu

### Settings Page
- **URL:** `http://localhost:3000/admin/settings`
- **Navigation:** Click ⚙️ Settings in sidebar

### New Files
```
✨ Created:
├── src/components/admin/AdminHeader.tsx
├── src/app/admin/settings/page.tsx
└── src/lib/platform-settings.ts

📝 Modified:
├── src/app/admin/layout.tsx
└── src/components/admin/Sidebar.tsx

📚 Documentation:
├── ADMIN_FEATURES.md
├── ADMIN_VISUAL_GUIDE.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## 🎮 Interactive Elements

### Hamburger Menu (Mobile)
```
Click hamburger icon (☰) → Sidebar slides out
                      ↓
Click link → Navigate & close
            OR
Click outside → Close sidebar
            OR
Click X icon → Close sidebar
```

### Settings Form
```
Input Fields:
├── Daily Vendor Fee (₹)          → Type number
├── Default Fare per KM (₹)       → Type number
├── Base Fare (₹)                 → Type number
├── Surge Multiplier              → Drag slider (1x-3x)
├── Maintenance Mode              → Toggle on/off
├── Default Currency              → Select dropdown
└── App Version                   → Type version (1.0.0)

Actions:
├── Save Changes                  → Saves to Firestore
├── Cancel                        → Reverts changes
└── Last Updated Info             → Shows timestamp & admin
```

---

## 🔐 Admin Profile Menu

```
Click on avatar → Opens dropdown

Actions:
├── View profile info (name & email)
└── Logout → Returns to login page
```

---

## 📊 Platform Settings Explained

| Setting | Purpose | Value Range | Default |
|---------|---------|-------------|---------|
| **Daily Vendor Fee** | Daily payment from vendors | ₹0+ | ₹100 |
| **Default Fare/KM** | Cost per kilometer | ₹0+ | ₹15 |
| **Base Fare** | Minimum ride charge | ₹0+ | ₹40 |
| **Surge Multiplier** | Peak hour increase | 1x - 3x | 1x |
| **Maintenance Mode** | Disable app | on/off | off |
| **Default Currency** | App currency symbol | ₹/$, € | ₹ |
| **App Version** | Mobile app version | x.y.z | 1.0.0 |

---

## 🚀 Quick Actions

### To Change Daily Vendor Fee:
1. Open Settings page (⚙️ icon in sidebar)
2. Find "Daily Vendor Fee (₹)"
3. Enter new amount (e.g., 150)
4. Click "Save Changes"
5. ✅ Saved confirmation appears

### To Enable Maintenance Mode:
1. Open Settings page
2. Find "Maintenance Mode" toggle
3. Click toggle to turn ON
4. 🔴 Red alert appears
5. Click "Save Changes"
6. Users will see maintenance page

### To Update App Version:
1. Open Settings page
2. Find "App Version" field
3. Update version (e.g., 1.1.0)
4. Click "Save Changes"
5. Mobile clients can be forced to update

### To Adjust Surge Pricing:
1. Open Settings page
2. Find "Surge Multiplier" slider
3. Drag slider to desired multiplier (e.g., 1.5x)
4. Real-time number updates in corner
5. Click "Save Changes"

---

## 🎯 Navigation Sidebar

```
Current Links:
📊 Dashboard      /admin/dashboard
🚗 Rides          /admin/rides
👥 Drivers        /admin/drivers
👤 Users          /admin/users
⚠️  Complaints    /admin/complaints
⚙️  Settings      /admin/settings          ← NEW!
🚪 Log Out        /login
```

---

## 📱 Responsive Behavior

### Desktop (≥ 768px)
- Fixed sidebar visible on left (264px)
- Hamburger menu hidden
- Header spans full width
- Form fields in two columns

### Mobile (< 768px)
- Hamburger menu visible in header
- Sidebar hidden by default
- Tap hamburger to show overlay sidebar
- Full-width form inputs

### Tablet
- Same as mobile behavior
- Slightly larger touch targets
- More spacing between elements

---

## 🔄 Data Flow

### Settings Load Flow
```
Page Mount
    ↓
useQuery triggered
    ↓
Fetch from Firestore collection: platformSettings
    ↓
Document: global
    ↓
Display in form (with fallback to defaults)
    ↓
Ready for editing
```

### Settings Save Flow
```
Click "Save Changes"
    ↓
Collect form values
    ↓
useMutation called
    ↓
Update Firestore document
    ↓
Add metadata:
  - updatedAt: current timestamp
  - updatedBy: admin email
    ↓
Success toast appears
    ↓
Last updated info refreshed
    ↓
hasChanges = false (Save button disabled)
```

---

## ⚠️ Maintenance Mode Alert

When **Maintenance Mode** is enabled:
```
┌─────────────────────────────────────────┐
│ ⚠️  Maintenance mode is currently        │
│    enabled. Users will not be able to   │
│    access the app.                      │
└─────────────────────────────────────────┘
```

**To Disable:**
1. Open Settings
2. Toggle Maintenance Mode OFF
3. Click "Save Changes"
4. Alert disappears
5. Users can access app again

---

## 🎨 UI Component Reference

| Component | Used For | Location |
|-----------|----------|----------|
| **Button** | Save/Cancel actions | Form actions |
| **Input** | Fee/fare/version entry | Form inputs |
| **Slider** | Surge multiplier | Form input |
| **Switch/Toggle** | Maintenance mode | Form input |
| **Select/Dropdown** | Currency choice | Form input |
| **Avatar** | Admin profile picture | Header |
| **DropdownMenu** | Profile menu | Header |
| **Alert** | Maintenance warning | Top of form |
| **Card** | Settings container | Main form |
| **Label** | Input descriptions | Form |

---

## 🔗 Firestore Collection

**Path:** `platformSettings/global`

```javascript
// Example document in Firestore:
{
  dailyVendorFee: 100,
  defaultFarePerKm: 15,
  baseFare: 40,
  surgeMultiplier: 1.5,
  maintenanceMode: false,
  defaultCurrency: "₹",
  appVersion: "1.0.0",
  updatedAt: Timestamp,      // Auto-filled on save
  updatedBy: "admin@email.com" // Auto-filled on save
}
```

---

## ✅ Verification Checklist

- [x] Admin header displays correctly
- [x] Hamburger menu works on mobile
- [x] Profile dropdown opens/closes
- [x] Settings page loads
- [x] All form inputs work
- [x] Slider adjusts smoothly
- [x] Toggle switches properly
- [x] Save button enabled when changed
- [x] Settings save to Firestore
- [x] Toast notifications appear
- [x] Last updated info shows
- [x] Mobile responsive
- [x] No TypeScript errors
- [x] No runtime errors

---

## 🆘 Troubleshooting

### Settings Page Won't Load
- Check: Is Firestore initialized?
- Check: User is logged in as admin?
- Check: Browser console for errors
- Try: Hard refresh (Ctrl+F5)

### Save Button Doesn't Work
- Check: Are there unsaved changes?
- Check: All inputs valid?
- Check: Network connection?
- Check: Firestore permissions?

### Hamburger Menu Won't Appear
- Check: Are you on mobile view?
- Check: Viewport width < 768px?
- Check: Browser DevTools responsive mode on?

### Settings Not Persisting
- Check: Did save succeed (toast)?
- Check: Firestore document exists?
- Check: Refresh page after save?
- Check: Firestore security rules?

---

## 📞 Support

For issues or questions:
1. Check browser console (F12)
2. Look for error messages
3. Verify Firestore document structure
4. Check admin user permissions
5. Review React Query dev tools
6. Check Next.js dev server logs

---

## 🎓 Learning Resources

- **AdminHeader:** See `src/components/admin/AdminHeader.tsx`
- **Settings Page:** See `src/app/admin/settings/page.tsx`
- **Types:** See `src/lib/platform-settings.ts`
- **Full Docs:** See `ADMIN_FEATURES.md`
- **Visual Guide:** See `ADMIN_VISUAL_GUIDE.md`

---

Generated: November 13, 2025
Version: 1.0.0
Status: ✅ Production Ready

