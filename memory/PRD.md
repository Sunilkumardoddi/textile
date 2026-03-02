# TextileTrace - Cloud-Based Textile Traceability Portal
## Product Requirements Document

### Original Problem Statement
Build a Cloud-Based Textile Traceability Portal with Multi-Role Access Control and End-to-End Supply Chain Tracking.

The portal supports 4 roles (Supplier merged into Manufacturer):
- **Admin**: System management, user approvals, overall monitoring, manufacturer management
- **Manufacturer**: Create batches, manage production, shipments, **AND receive/manage Purchase Orders from Brands**
- **Brand**: Track manufacturer traceability, request audits, view compliance, create Purchase Orders
- **Auditor**: Verify transactions, approve/reject batches

System tracks: Raw Material → Processing → Production → Shipment → Audit Verification

---

## What's Been Implemented (March 2, 2026)

### Role Merge: Supplier → Manufacturer (March 2, 2026)
- Supplier role has been merged into Manufacturer role
- Manufacturers now act as both producers AND suppliers
- Brands create Purchase Orders to Manufacturers directly
- All supplier-related APIs now work with manufacturer role

### Purchase Order Management Module

#### Backend API Endpoints
- [x] `/api/suppliers/` - Manufacturer profiles as suppliers (CRUD)
- [x] `/api/suppliers/stats` - Manufacturer/supplier statistics (Admin only)
- [x] `/api/suppliers/{id}/activate` - Activate manufacturer
- [x] `/api/suppliers/{id}/deactivate` - Deactivate manufacturer
- [x] `/api/suppliers/{id}/lock` - Lock high-risk manufacturer
- [x] `/api/suppliers/{id}/performance` - Performance metrics
- [x] `/api/purchase-orders/` - Full CRUD for Purchase Orders
- [x] `/api/purchase-orders/stats` - PO statistics
- [x] `/api/purchase-orders/{id}/accept` - Manufacturer accepts PO
- [x] `/api/purchase-orders/{id}/reject` - Manufacturer rejects PO
- [x] `/api/purchase-orders/{id}/status` - Update PO status

#### Frontend Features
- [x] **Manufacturer Dashboard Updates**
  - Added "Purchase Orders" navigation item
  - Stats: Total Batches, Pending Orders, Active Orders, Shipments, Total Order Value
  - "Orders Awaiting Acceptance" section with Accept/Reject buttons
  - View incoming POs from Brands
- [x] **Brand Dashboard Updates**
  - "Manufacturer Directory" section showing active manufacturers
  - Create PO button for each manufacturer
  - PO Creation Dialog with product details, delivery info
  - Recent Purchase Orders list with status badges
- [x] **Admin Dashboard Updates**
  - Registered Manufacturers and High Risk Manufacturers stat cards
  - Manufacturer Overview section with risk distribution
  - Supplier routing and navigation

#### Database Schema Additions
- `suppliers` collection: company_name, country, certifications, compliance_score, risk_category, etc.
- `purchase_orders` collection: po_number, brand_id, supplier_id, line_items, status, delivery_date, etc.
- `supplier_performance_metrics` collection: For calculated metrics
- `po_status_logs` collection: Status change history

---

### Backend (FastAPI + MongoDB)

#### Authentication & Authorization
- [x] JWT-based authentication with bcrypt password hashing
- [x] Role-Based Access Control (RBAC) for 4 roles
- [x] Session management with token expiration
- [x] Login attempt tracking
- [x] User registration with pending approval workflow

#### API Endpoints
- [x] `/api/auth/register` - User registration
- [x] `/api/auth/login` - JWT token generation
- [x] `/api/auth/logout` - Session termination
- [x] `/api/auth/me` - Get/update current user profile
- [x] `/api/users/*` - User management (Admin only)
- [x] `/api/batches/*` - Batch CRUD with traceability
- [x] `/api/materials/*` - Material inward management
- [x] `/api/production/*` - Production log entries
- [x] `/api/shipments/*` - Shipment tracking
- [x] `/api/audits/*` - Audit management
- [x] `/api/dashboard/*` - Role-based dashboard data
- [x] `/api/reports/*` - Traceability reports, exports

#### Database Schema (MongoDB Collections)
- users
- batches
- materials
- production_logs
- shipments
- audits
- transactions
- documents
- activities (immutable audit trail)
- alerts

#### Security Features
- [x] Password encryption (bcrypt)
- [x] JWT token with expiration
- [x] Role-based route protection
- [x] Activity logging (immutable audit trail)
- [x] Input validation with Pydantic

### Frontend (React + TailwindCSS)

#### Authentication Pages
- [x] Login page with demo credentials
- [x] Registration page with role selection
- [x] Protected route handling
- [x] Auto-redirect based on role

#### Dashboards
- [x] Admin Dashboard
  - Total Users, Active Manufacturers/Brands stats
  - Pending Approvals with approve button
  - Batch Status overview
  
- [x] Manufacturer Dashboard
  - Total Batches, Materials, Shipments stats
  - Recent Batches list
  - Quick Actions (New Batch, Add Production, Create Shipment, Upload TC)
  
- [x] Brand Dashboard
  - Tracked Batches, Compliance Score stats
  - Incoming Shipments
  - Quick Actions (View Traceability, Request Audit)
  
- [x] Auditor Dashboard
  - Assigned Audits, Pending, Completed stats
  - Performance metrics
  - Pending Audits list

#### UI/UX Features
- [x] Dark theme with emerald/teal accents
- [x] Responsive sidebar navigation
- [x] Role-based menu items
- [x] Toast notifications
- [x] Loading states
- [x] Mobile-friendly layout

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@textile.com | testpassword |
| Manufacturer | manufacturer@textile.com | testpassword |
| Brand | brand@textile.com | testpassword |
| Auditor | auditor@textile.com | testpassword |
| Supplier | supplier@testsupplier.com | testpassword |

---

## API Documentation

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login and get JWT token
POST /api/auth/logout - Logout (client discards token)
GET /api/auth/me - Get current user profile
PUT /api/auth/me - Update current user profile
```

### Batches
```
GET /api/batches - List batches (filtered by role)
POST /api/batches - Create new batch
GET /api/batches/{id} - Get batch details
PUT /api/batches/{id} - Update batch
DELETE /api/batches/{id} - Soft delete batch
GET /api/batches/{id}/traceability - Full traceability chain
GET /api/batches/stats - Batch statistics
```

### Reports
```
GET /api/reports/batch-traceability/{id} - Traceability report
GET /api/reports/material-balance - Material balance summary
GET /api/reports/compliance-certificate/{id} - Compliance certificate
GET /api/reports/export/batches - CSV export
GET /api/reports/analytics/overview - Dashboard analytics
```

---

## Prioritized Backlog

### P0 - High Priority (Next)
- [ ] Supplier Performance Engine - Auto-calculate metrics after PO completion
- [ ] Brand Dashboard Supplier Analytics - Charts for supplier performance
- [ ] Admin Supplier Management Page - Full CRUD UI for suppliers
- [ ] PO Status Update Flow - Supplier updates through production/shipping/delivery

### P1 - Medium Priority
- [ ] Batch creation form page
- [ ] Material inward entry form
- [ ] Production log entry form
- [ ] Shipment creation form
- [ ] Batch details page with traceability visualization
- [ ] User management page (Admin)
- [ ] Audit workflow pages (start, add findings, approve/reject)
- [ ] PDF report generation
- [ ] Excel export functionality

### P2 - Lower Priority
- [ ] Dashboard analytics charts (line charts, pie charts)
- [ ] QR code generation for batch tracking
- [ ] Email notifications
- [ ] Document/Certificate upload with file storage
- [ ] Alert management UI

### Future Enhancements
- [ ] Two-Factor Authentication (2FA)
- [ ] Blockchain integration for immutable records
- [ ] Mobile app support
- [ ] ERP integration APIs
- [ ] Multi-country compliance modules
- [ ] Power BI dashboard embedding

---

## Tech Stack
- **Backend**: FastAPI, Python 3.x
- **Database**: MongoDB
- **Frontend**: React 18, TailwindCSS, shadcn/ui
- **Auth**: JWT (python-jose), bcrypt
- **API Client**: Axios
- **State Management**: React Context

---

## Architecture
```
/app
├── backend/
│   ├── models/         # Pydantic models
│   ├── routes/         # API endpoints
│   ├── utils/          # Auth, DB, alerts, activity logger
│   ├── tests/          # pytest tests
│   └── server.py       # FastAPI app
├── frontend/
│   ├── src/
│   │   ├── components/ # UI components, layouts
│   │   ├── contexts/   # Auth context
│   │   ├── lib/        # API client
│   │   └── pages/      # Page components
│   └── public/
└── memory/
    └── PRD.md          # This file
```

---

## Testing Status
- Backend: 100% (14/14 tests passed for Supplier/PO module)
- Frontend: 100%
- Last tested: March 2, 2026
- Test report: `/app/test_reports/iteration_3.json`
