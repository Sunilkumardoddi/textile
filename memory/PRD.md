# TextileTrace - Cloud-Based Textile Supply Chain ERP & Traceability Platform
## Product Requirements Document

### Original Problem Statement
Build a Cloud-Based Textile Supply Chain ERP and Brand Dashboard Platform with end-to-end traceability. The system allows a Brand (top-level user) to monitor and control the entire supply chain, while multiple Suppliers (manufacturers, fabric mills, yarn suppliers, processors) enter real-time production and material data.

The portal supports 5 roles (expandable to multi-tier suppliers):
- **Super Admin**: System management, user approvals, overall monitoring
- **Brand**: Track supply chain, view analytics, create Purchase Orders, monitor compliance, manage seasons
- **Manufacturer**: Create batches, manage production, shipments, receive/manage Purchase Orders
- **Designer**: Create designs, CADs, submit to seasons
- **Auditor**: Verify transactions, approve/reject batches

Future: Fabric Supplier, Yarn Supplier roles for multi-tier supply chain

System tracks: Fiber → Yarn → Fabric → Garment → Dispatch

---

## What's Been Implemented (April 6, 2026)

### ERP Phase 5: Incoming & Dispatch Management Module (April 6, 2026)
Comprehensive inbound logistics tracking system for all shipments from manufacturers against each PO:

#### Backend API Endpoints
- [x] `/api/incoming/destinations` - CRUD for store/warehouse destinations with GPS coordinates
- [x] `/api/incoming/invoices` - Create/manage invoices (manufacturer); View invoices (brand)
- [x] `/api/incoming/dispatches` - Create/manage dispatches with vehicle, driver, transporter info
- [x] `/api/incoming/dispatches/{id}/tracking` - Update dispatch status and GPS location
- [x] `/api/incoming/dispatches/{id}/receive` - Mark dispatch as received (brand only)
- [x] `/api/incoming/dispatches/{id}/simulate-tracking` - Simulate GPS tracking updates (DEMO)
- [x] `/api/incoming/dispatches/{id}/documents` - Upload dispatch documents (challan, e-way bill)
- [x] `/api/incoming/invoices/{id}/documents` - Upload invoice documents
- [x] `/api/incoming/po/{po_id}/summary` - Get complete PO incoming summary with invoices & dispatches
- [x] `/api/incoming/po/{po_id}/invoices` - Get all invoices for a PO
- [x] `/api/incoming/po/{po_id}/dispatches` - Get all dispatches for a PO
- [x] `/api/incoming/alerts` - Get/resolve incoming alerts (delay, stuck, partial delivery)
- [x] `/api/incoming/dashboard/overview` - Brand dashboard stats
- [x] `/api/incoming/dashboard/pos-with-shipments` - POs with shipment summaries
- [x] `/api/incoming/analytics/delivery-performance` - On-time %, avg delay, avg transit time
- [x] `/api/incoming/analytics/supplier-logistics` - Supplier performance rankings
- [x] `/api/incoming/analytics/distance-delivery` - Distance range vs delivery time analysis

#### Frontend Features
- [x] **Incoming Dashboard** (`/dashboard/brand/incoming` or `/dashboard/brand/shipments`)
  - Summary Cards: Total Invoices, In Transit, Delivered, Pending, Delayed, Active Alerts
  - Quantity Metrics: Dispatched, Received (green), Pending (amber) with progress bars
  - **4 Tabs:**
    1. Overview: Delivery Performance (PieChart), Distance vs Delivery Time (BarChart), Supplier Logistics Performance (Table)
    2. PO Shipments: Searchable/filterable list with color indicators (green/yellow/red/blue), invoice count, quantity stats, status badges
    3. Analytics: Detailed delivery performance breakdown, Top performing suppliers rankings
    4. Alerts: Active alerts with severity badges and resolve functionality
- [x] **PO Incoming Detail** (`/dashboard/brand/incoming/po/:poId`)
  - Summary Cards: Invoices, Ordered, Dispatched, Received, In Transit, Delayed
  - Progress bar showing % received
  - **3 Tabs:**
    1. Invoices: Expandable invoice cards with dispatch details, Track/Simulate/Receive buttons
    2. Live Tracking: OpenStreetMap (Leaflet) with source (blue), current (yellow), destination (green) markers, route visualization
    3. Documents: Uploaded dispatch documents with download

#### Database Schema Additions
- `destinations`: {id, brand_id, name, address, city, country, latitude, longitude, contact_person, contact_phone, destination_type}
- `invoices`: {id, invoice_number, po_id, supplier_id, brand_id, destination_id, line_items, quantity_shipped/received/pending, status, delivery_status, delay_hours, distance_km, documents}
- `dispatches`: {id, dispatch_number, invoice_id, po_id, supplier_id, destination_id, quantity_dispatched/received, status, delivery_status, vehicle_number, driver_name, current_location, tracking_history, documents}
- `incoming_alerts`: {id, alert_type, severity, title, description, po_id, invoice_id, dispatch_id, is_resolved}

#### Alert System
- Automatic alerts for delivery delays > 24 hours (HIGH/CRITICAL severity)
- Automatic alerts for partial deliveries
- Manual alerts for shipment stuck, missing documents

#### Map Integration
- Leaflet/OpenStreetMap for live tracking visualization
- Haversine formula for distance calculation
- Simulated GPS tracking for demo purposes

---

### ERP Phase 4: PO Reports Management Module - ENHANCED (April 6, 2026)
Comprehensive reporting system for production, quality, and testing at PO level with Power BI-style analytics:

#### Backend API Endpoints
- [x] `/api/reports/po/{po_id}` - Get PO reports summary (counts, averages)
- [x] `/api/reports/po/{po_id}/analytics` - Get charts data (production trends, quality trends, defect breakdown)
- [x] `/api/reports/po/{po_id}/timeline` - Get chronological reports list
- [x] `/api/reports/po/{po_id}/enhanced-summary` - **NEW** Enhanced summary with status breakdown, type breakdown, alerts
- [x] `/api/reports/po/{po_id}/supplier-performance` - **NEW** Supplier performance metrics (quality score, efficiency, on-time rate)
- [x] `/api/reports/po/{po_id}/missing-dates` - **NEW** Find dates missing production/quality reports
- [x] `/api/reports/po/{po_id}/report-detail/{type}/{id}` - **NEW** Detailed report view with approval history
- [x] `/api/reports/po/{po_id}/alerts-panel` - **NEW** Categorized alerts by severity (critical/warning/info)
- [x] `/api/reports/production` - CRUD for Daily Production Reports (DPR)
- [x] `/api/reports/quality` - CRUD for Daily Quality Reports (DQR) with defect tracking
- [x] `/api/reports/inspection` - CRUD for Final Inspection Reports (AQL, pass/fail)
- [x] `/api/reports/fabric-tests` - CRUD for Fabric Test Reports (GSM, shrinkage, color fastness)
- [x] `/api/reports/trims` - CRUD for Trims & Accessories Reports
- [x] `/api/reports/{type}/{id}/approve` - Approval workflow (Brand only)
- [x] `/api/reports/alerts` - Report alerts (high DHU, failed inspection)
- [x] `/api/reports/alerts/{alert_id}/resolve` - **NEW** Resolve alert with notes
- [x] `/api/reports/upload` - File upload for report attachments

#### Frontend Features
- [x] **PO Reports Dashboard** (`/dashboard/brand/po/:poId/reports`) - POWER BI STYLE
  - Summary cards: Total Reports, Pending, Approved, Rejected, Alerts
  - KPI cards: Avg Efficiency %, Avg DHU % (red if >5%), Inspection Pass Rate %, Supplier Score
  - Active Alerts Panel: Categorized by severity (Critical/Warning/Info) with Resolve buttons
  - **7 Tabs:**
    1. Overview: Production Trend (LineChart), Quality Trend (BarChart with threshold), Inspection Results (PieChart), Top Defects list
    2. Production: DPR list with efficiency, status badges, Review buttons
    3. Quality: DQR list with DHU, critical defect badges, status badges
    4. Inspection: Inspection list with PASS/FAIL/CONDITIONAL result, AQL levels, approved/rejected counts
    5. Tests: Fabric Test and Trims reports with passed/failed counts
    6. Timeline: **CRITICAL FEATURE** - Chronological view with color-coded dots (blue=production, purple=quality, green=inspection), date filters, type filter, Missing Report Dates alert
    7. Supplier Performance: **NEW** Overall score, quality metrics
  - Approval workflow dialog (Approve/Reject/Under Review with comments)
  - Cross-navigation: "View Traceability" button links to Traceability Detail
- [x] **Traceability Detail** - Added "View Reports" button for cross-navigation

#### Database Schema Additions
- `production_reports`: lines, target/actual, efficiency, WIP, cumulative stats
- `quality_reports`: defects (major/minor/critical), DHU%, rejection rate
- `inspection_reports`: AQL level, pass/fail result, findings, inspector info
- `fabric_test_reports`: GSM, shrinkage, color fastness tests, lab info
- `trims_reports`: button/zipper/label tests
- `report_alerts`: missing report, high defect, failed inspection alerts with severity levels

#### Alert System
- Automatic alerts for DHU > 5% (severity: HIGH)
- Automatic alerts for efficiency < 70% (severity: MEDIUM)
- Automatic alerts for failed inspections (severity: HIGH)
- Automatic alerts for critical defects (severity: HIGH)
- Missing report dates detection

### ERP Phase 3: Traceability & Sustainability Module (April 6, 2026)
Complete PO-wise and Season-wise traceability tracking system:

#### Backend API Endpoints
- [x] `/api/traceability/stats/overview` - Overall traceability statistics
- [x] `/api/traceability/po/{po_id}` - Create/Get traceability record for a PO
- [x] `/api/traceability/po/{po_id}/supply-chain` - Update supply chain stages (Fiber→Yarn→Fabric→Garment→Dispatch)
- [x] `/api/traceability/po/{po_id}/suppliers` - Update tier-wise supplier mapping (Tier 1/2/3)
- [x] `/api/traceability/po/{po_id}/materials` - Update material details (GSM, composition, certifications)
- [x] `/api/traceability/po/{po_id}/documents` - Upload sustainability/compliance documents
- [x] `/api/traceability/po/{po_id}/documents/{doc_id}/verify` - Verify/reject documents
- [x] `/api/traceability/season/{season_id}` - Aggregated season traceability stats
- [x] `/api/traceability/season/{season_id}/pos` - POs with traceability status for a season
- [x] `/api/traceability/alerts` - Get active traceability alerts
- [x] `/api/traceability/alerts/{alert_id}/resolve` - Resolve an alert

#### Frontend Features
- [x] **Traceability Dashboard** (`/dashboard/brand/traceability`)
  - Stats cards: Avg Traceability Score, Compliance Score, Tracked POs, Active Alerts
  - Status Distribution: Verified, Complete, Partial, Missing counts
  - Tabs: Purchase Orders, Alerts, By Season
  - PO list with traceability indicators (color-coded icons)
  - Search and filter by status
- [x] **PO Traceability Detail Page** (`/dashboard/brand/traceability/:poId`)
  - PO header with traceability symbol indicator
  - Score cards: Traceability %, Compliance %, Tier Suppliers, Documents
  - Alerts banner for action items
  - **5 Tabs**:
    1. Supply Chain: Visual flow diagram (Fiber→Yarn→Fabric→Garment→Dispatch) with clickable stages
    2. Supplier Mapping: Tier 1/2/3 supplier cards
    3. Materials: Composition, GSM, certifications, sustainability tags
    4. Documents: Upload/view sustainability reports, verify/reject
    5. Alerts: Active alerts with severity badges

#### Database Schema Additions
- `traceability_records`: po_id, supply_chain[], tier_suppliers[], material_details, documents[], status, traceability_score, compliance_score
- `traceability_alerts`: po_id, alert_type, severity, title, description, is_resolved

#### Key Features
- Automatic traceability score calculation based on completeness (0-100%)
- Automatic compliance score based on document verification
- Auto-generated alerts for missing data, expired certifications, incomplete mapping
- Visual supply chain flow with green (complete) / gray (pending) stages
- Document upload with expiry tracking and verification workflow
- Color-coded status indicators: Green (Verified), Blue (Complete), Yellow (Partial), Red (Missing)

### ERP Phase 2: Manufacturer Collection Module (April 6, 2026)
Complete Fabric Swatch Collection system for brand design workflow:

#### Backend API Endpoints
- [x] `/api/collections/` - Full CRUD for Manufacturer Collections
- [x] `/api/collections/{id}` - Get collection details with enriched counts
- [x] `/api/collections/{id}/analytics` - Analytics (by status, fabric type, supplier)
- [x] `/api/collections/{id}/invite` - Invite manufacturers to collection
- [x] `/api/collections/{id}/swatches` - Upload/list swatches
- [x] `/api/collections/{id}/swatches/bulk` - Bulk upload with CSV metadata
- [x] `/api/collections/{id}/swatches/select` - Shortlist/select/reject swatches
- [x] `/api/collections/{id}/swatches/count` - Quick counts by status
- [x] `/api/collections/{id}/swatches/duplicates` - Duplicate detection
- [x] `/api/collections/{id}/suppliers/stats` - Supplier performance stats
- [x] `/api/collections/swatches/{id}` - Get swatch details (marks as viewed)

#### Frontend Features
- [x] **Season Detail - Fabric Collections Tab**
  - Collection cards with code, status, supplier/swatch counts
  - "New Collection" button to create collections
  - Click card to navigate to collection detail
- [x] **Manufacturer Collection Page** (`/dashboard/brand/seasons/:seasonId/collections/:collectionId`)
  - Stats: Suppliers, Total Swatches, Shortlisted, Selected, Sustainable %
  - Pinterest-style masonry grid view for swatches
  - List view toggle option
  - Advanced filters: Fabric type, Weave type, GSM range, Status, Tags
  - Search swatches functionality
  - Swatch selection with checkboxes
  - Bulk actions: Select All, Shortlist, Select, Reject
  - Swatch detail modal with full metadata
  - Duplicate badge indicator
- [x] **Swatch Card Features**
  - Thumbnail image with hover preview
  - Status badge (uploaded, viewed, shortlisted, selected, rejected)
  - Fabric type and GSM badges
  - Supplier name and swatch code
  - Tags display

#### Database Schema Additions
- `manufacturer_collections` collection: name, season_id, deadline, max_swatches_per_supplier, guidelines, status
- `swatches` collection: metadata (fabric_type, gsm, composition, weave_type, color, pattern), tags, certifications, status

### ERP Phase 1: Season & Mood Board Module (March 2, 2026)
Complete Season Management system for brand design workflow:

#### Backend API Endpoints
- [x] `/api/seasons/` - Full CRUD for Season management
- [x] `/api/seasons/{id}/stats` - Season statistics (designs by status, category, supplier)
- [x] `/api/seasons/{id}/mood-boards` - Create/list mood boards for a season
- [x] `/api/seasons/mood-boards/{id}` - Get mood board details
- [x] `/api/seasons/mood-boards/{id}/images` - Add images to mood board
- [x] `/api/seasons/{id}/designs` - Submit/list designs for a season
- [x] `/api/seasons/designs/{id}` - Get design details
- [x] `/api/seasons/{id}/designs/select` - Bulk select/reject designs
- [x] `/api/seasons/{id}/designs/duplicates` - Get duplicate design alerts

#### Frontend Features
- [x] **Season Management Page** (`/dashboard/brand/seasons`)
  - Season cards with code (FW26, SS26), status, progress
  - Stats: Total Seasons, In Design Phase, Designs Selected, Total Submissions
  - Create Season dialog with type, year, target styles, budget
  - Search and filter by status
- [x] **Season Detail Page** (`/dashboard/brand/seasons/:id`)
  - Stats: Designs Submitted, Selected, Pending Review, Mood Boards, Selection Rate
  - Progress bar showing progress to target styles
  - Tabs: Overview, Mood Boards, Designs, Suppliers
  - Overview: Designs by Category, Top Suppliers
  - Mood Boards: Create/view mood boards with image uploads
  - Designs: Grid/List view with bulk select/reject
  - Suppliers: Performance metrics by supplier
- [x] **Designer Role** - Added to user roles for design submissions

### Phase 1: Power BI-Style Brand Dashboard (March 2, 2026)
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

### P0 - High Priority (Upcoming)
- [ ] **Manufacturer Swatch Upload Interface** - Frontend for manufacturers to bulk upload swatches with metadata
- [ ] **Duplicate & Similarity Detection** - Backend logic to detect similar designs across suppliers
- [ ] **Swatch Shortlisting Flow** - Enable Brands to convert shortlisted swatches to Design Development stage
- [ ] **Manufacturer Traceability Input** - Allow manufacturers to upload traceability data for their stages

### P1 - Medium Priority (ERP Phase 4)
- [ ] **Image Storage & CDN Optimization** - AWS S3 integration for handling 100K+ swatch images efficiently
- [ ] **Manufacturer Performance Analytics** - Rank suppliers by swatch selection ratio and quality
- [x] ~~**Full Traceability System** - Fiber → Yarn → Fabric → Garment → Dispatch tracking~~ (DONE - Phase 3)
- [x] ~~**Compliance & Certifications Module** - Track Sedex, BSCI, WRAP certifications~~ (DONE - Phase 3)
- [ ] **Multi-Tier Supplier Hierarchy** - Add Fabric Supplier, Yarn Supplier roles

### P2 - Lower Priority
- [ ] **Inventory Management** - Raw materials, WIP, Finished goods tracking
- [x] ~~**Alert System** - Delay alerts, compliance expiry~~ (DONE - Phase 3)
- [ ] Batch creation form page
- [ ] QR code generation for batch/order tracking
- [ ] PDF report generation
- [ ] Excel export functionality
- [ ] Email notifications

### Future Enhancements
- [ ] AI-based delay prediction
- [ ] Cost overrun alerts
- [ ] Blockchain-based traceability
- [ ] Two-Factor Authentication (2FA)
- [ ] Mobile app support
- [ ] Power BI integration for advanced analytics

---

## Tech Stack
- **Backend**: FastAPI, Python 3.x, Pillow (image processing)
- **Database**: MongoDB
- **Frontend**: React 18, TailwindCSS, shadcn/ui, Recharts
- **Auth**: JWT (python-jose), bcrypt
- **API Client**: Axios
- **State Management**: React Context

---

## Architecture
```
/app
├── backend/
│   ├── models/         # Pydantic models (swatch.py, season.py, etc.)
│   ├── routes/         # API endpoints (collections.py, seasons.py, etc.)
│   ├── utils/          # Auth, DB, alerts, activity logger
│   ├── uploads/        # Swatch images and thumbnails
│   ├── tests/          # pytest tests
│   └── server.py       # FastAPI app
├── frontend/
│   ├── src/
│   │   ├── components/ # UI components, layouts
│   │   ├── contexts/   # Auth context
│   │   ├── lib/        # API client
│   │   └── pages/      # Page components (brand/, dashboards/)
│   └── public/
└── memory/
    └── PRD.md          # This file
```

---

## Testing Status
- Backend: 100% (22/22 tests passed for PO Reports module)
- Frontend: 100%
- Last tested: April 6, 2026
- Test reports: 
  - `/app/test_reports/iteration_5.json` (Collections module)
  - `/app/test_reports/iteration_6.json` (Traceability module)
  - `/app/test_reports/iteration_7.json` (PO Reports module)
