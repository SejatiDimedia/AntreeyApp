# Antreey Project Status & Roadmap

Document updated: 2026-05-12

## 📊 Overall Progress: 95%
Phase 1-7 (UI Slicing & Firebase Foundation) are **COMPLETED**. We are now moving into the final logic integration and AI enhancement phases.

---

## ✅ Completed Milestones

### Phase 1: Foundation
- [x] Vite + React project initialized.
- [x] Tailwind CSS configured with Stitch Design System tokens.
- [x] Global styles and typography (Plus Jakarta Sans) integrated.

### Phase 2: Core Shell & Layout
- [x] `MainLayout` shell with responsive sidebar and topbar.
- [x] Navigation system for switching between modules.

### Phase 3: Auth Pages (Slicing)
- [x] Premium Sign In page.
- [x] Premium Sign Up page.

### Phase 4: Main Dashboard (Slicing)
- [x] Bento Grid bookings overview.
- [x] Live queue table.
- [x] Quick insights metrics.

### Phase 5: Additional Modules (Slicing)
- [x] **Staff Management**: Schedule and availability.
- [x] **Services Management**: Service list and pricing.
- [x] **Customer Database**: Customer profiles and history.
- [x] **Business Settings**: Operating hours and business profile.
- [x] **General Analytics**: Advanced dashboard charts and metrics.

### Phase 5.5: Customer-Facing App
- [x] **Mobile Layout**: Shell simulating a smartphone interface.
- [x] **Storefront**: Service selection landing page.
- [x] **Booking Flow**: Date, time, and staff selection steps.
- [x] **Live Ticket**: Real-time queue ticket for end-users.

### Phase 6 & 7: Firebase Integration
- [x] Firebase dependency installed and configured.
- [x] `AuthContext` implemented for global login state.
- [x] **Repository Pattern**: `UserRepository`, `BusinessRepository`, and `BookingRepository` implemented.
- [x] All repositories refactored to match `firebase-blueprint.json` and `firestore.rules`.
- [x] Auth UI (Sign In/Up) wired to Firebase Authentication.

---

## 🚀 Remaining Tasks (Phase 8+)

### Phase 8: Data Wiring & Real-time Logic (IN PROGRESS)
- [x] **Business Context**: Logic to fetch and manage the active business ID for the owner.
- [x] **Dashboard Wiring**: Connect real-time Firestore listeners to the admin dashboard.
- [x] **Bookings Wiring**: Enable "Call Next" and status updates from the Bento grid.
- [x] **Resource Management**: Implement Add/Edit/Delete for Services and Staff.
- [x] **Customer App Sync**: Connect the booking form to Firestore and the Live Ticket to real-time status updates.
- [x] **Customer Management (Realtime)**: Add/Edit/Delete/Role update, Firestore-based table, default avatar fallback, and live CustomerStats.
- [x] **Owner Customer Membership**: Owner customer list now scoped by active business membership (`businesses/{businessId}/customers/{customerId}`).
- [x] **Assign Existing Customer**: Owner can assign existing customer to another owned business.
- [x] **Membership Access Control UI**: Edit customer now shows business membership badges and supports revoke access per business.
- [x] **Routing Migration**: Move from local state navigation to `react-router-dom`.
- [x] **Multi-Business Switcher**: Owner/admin can switch active business from topbar and pages auto-sync without refresh.
- [x] **Create Business Flow (Owner)**: Add business modal in topbar and instant activation after create.
- [x] **Global Resource Management**: Added CRUD resources per business (`businesses/{businessId}/resources`) with status/capacity/type model.
- [x] **Service-Resource Mapping**: Service now supports resource requirement type and resource assignment list (`resourceIds`).
- [x] **Service Icon Generalization**: Removed salon-specific default icon behavior and enabled neutral configurable icons.
- [x] **Service Analytics Wiring**: Service Distribution now reads booking/service metrics from Firestore (with empty-state handling when data is not available).
- [x] **Business Settings Wiring**: Business Profile form now loads/saves real Firestore business data for the active business.
- [x] **Resources UX Hardening**: Full-screen modal backdrop fix, edit/delete confirmation, and created-at ordering.
- [x] **Queue Number Customization**: Business can configure queue prefix and digit length in Settings (e.g., `BRB-001`).
- [x] **Queue TV Enhancement**: Added Global / Per Service mode switch with service-lane now-serving + waiting list.
- [x] **Owner Calendar Integration**: Booking table now syncs with selected calendar date and calendar shows booking count badges per day.
- [x] **Walk-in Booking UI**: Added owner modal for walk-in creation (service/date/start time/duration) with Sonner feedback.
- [x] **My Bookings + Ticket Consistency**: Customer can open ticket detail from my bookings with the same ticket-style UI flow.

### Phase 8.5: Role-Based Access Control (RBAC) (IN PROGRESS)
- [x] **Role Definition**: Implement `role` logic in `AuthContext` (Owner, Staff, Customer).
- [x] **Protected Routes**: Restrict access to admin pages based on user roles.
- [x] **UI Conditional Rendering**: Show/hide menu items based on the active user's permissions.
- [x] **Firestore Rules Baseline Fix**: Resolved auth/domain/firestore database target issues and aligned rules deployment to the active Firestore database ID.
- [x] **Firestore Rules Refinement**: Membership-based access for customer app and owner scope stabilized (`businesses/*/customers/*`, services/resources visibility flow).

### Phase 9: AI Integration (Gemini 2.5 Flash)
- [ ] **AI Slot Recommendation**: Analyze historical data to suggest the best booking time.
- [ ] **AI Waiting Time Prediction**: Calculate dynamic wait times based on live queue speed.
- [ ] **AI Anti No-Show**: Risk analysis for customers based on cancellation history.

### Phase 10: Final Polish & Deployment
- [ ] UI micro-animations and transitions.
- [ ] Error handling and empty states for all tables.
- [ ] Production build and Firebase Hosting deployment.

---

## ▶️ Next Execution Focus

### Phase 8.6: Booking Engine v2 (IN PROGRESS)
- [x] **Resource-aware Availability**: Overlap prevention now checks service/resource/staff constraints and time range.
- [x] **Slot Generation from Real Availability**: Customer app disables slots using realtime overlap checks (including walk-in ranges).
- [x] **Atomic Booking Validation on Submit**: Conflict re-check enforced at submit in repository before write.
- [ ] **Booking Lifecycle Hardening**: Finalize robust status transitions + edge-case reconciliation.
- [ ] **Hard Transaction Locking**: Move critical conflict validation into Firestore transaction/cloud function for race-condition proofing.
