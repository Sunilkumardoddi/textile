# TextileTrace - Cloud-Based Textile Supply Chain ERP & Traceability Platform
## Product Requirements Document

### Original Problem Statement
Build a Cloud-Based Textile Supply Chain ERP and Brand Dashboard Platform with end-to-end traceability. The system allows a Brand (top-level user) to monitor and control the entire supply chain, while multiple Suppliers (manufacturers, fabric mills, yarn suppliers, processors) enter real-time production and material data.

The portal supports 4 roles (expandable to multi-tier suppliers):
- **Super Admin**: System management, user approvals, overall monitoring
- **Brand**: Track supply chain, view analytics, create Purchase Orders, monitor compliance
- **Manufacturer**: Create batches, manage production, shipments, receive/manage Purchase Orders
- **Auditor**: Verify transactions, approve/reject batches

Future: Fabric Supplier, Yarn Supplier roles for multi-tier supply chain

System tracks: Fiber → Yarn → Fabric → Garment → Dispatch

---

## What's Been Implemented (March 2, 2026)

### Phase 1: Power BI-Style Brand Dashboard (NEW - March 2, 2026)
Enhanced Brand Dashboard with real-time KPIs and interactive charts:

#### KPI Metrics (Power BI Style)
- [x] **Total Orders** - With trend indicator (+12% vs last month)
- [x] **Production Progress** - Overall completion percentage with trend
- [x] **Delayed Orders** - Count with attention status
- [x] **Compliance Status** - Score with compliant/review needed indicator
- [x] **Secondary KPIs** - Active Suppliers, In Transit, Pending Approval, In Production

#### Interactive Charts (Recharts)
- [x] **Production Progress Chart** - Area chart showing Planned vs Actual production over time
- [x] **Supplier Performance Chart** - Horizontal bar chart with Compliance, On-Time Delivery, Quality scores
- [x] **Order Distribution Chart** - Pie chart showing order status distribution

#### Dashboard Features
- [x] "Supply Chain Command Center" header with Live indicator
- [x] Real-time data refresh capability
- [x] Supplier Directory with quick Create PO action
- [x] Recent Purchase Orders table with progress bars and Track button
- [x] Quick Actions grid (Traceability, Audit, Analytics, Compliance)

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

### P0 - High Priority (In Progress - ERP Phase 2)
- [ ] **Multi-Tier Supplier Hierarchy** - Add Fabric Supplier, Yarn Supplier roles
- [ ] **Full Traceability System** - Fiber → Yarn → Fabric → Garment → Dispatch tracking
- [ ] **Drill-down capability** - Click Order → View Manufacturer → Fabric → Yarn details
- [ ] **Supplier Input Module** - Production updates, material details, batch numbers

### P1 - Medium Priority (ERP Phase 3-4)
- [ ] **Compliance & Certifications Module** - Track Sedex, BSCI, WRAP certifications
- [ ] **Inventory Management** - Raw materials, WIP, Finished goods tracking
- [ ] **Alert System** - Delay alerts, low production alerts, compliance expiry
- [ ] Batch creation form page
- [ ] Material inward entry form
- [ ] Production log entry form
- [ ] Shipment creation form
- [ ] QR code generation for batch/order tracking

### P2 - Lower Priority
- [ ] Batch details page with traceability visualization
- [ ] User management page (Admin)
- [ ] Audit workflow pages (start, add findings, approve/reject)
- [ ] PDF report generation
- [ ] Excel export functionality
- [ ] Email notifications
- [ ] Document/Certificate upload with file storage

### Future Enhancements
- [ ] AI-based delay prediction
- [ ] Cost overrun alerts
- [ ] Blockchain-based traceability
- [ ] Two-Factor Authentication (2FA)
- [ ] Mobile app support
- [ ] Power BI integration for advanced analytics
- [ ] Multi-country compliance modules

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
