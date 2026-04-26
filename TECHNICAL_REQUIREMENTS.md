# TextileTrace — Technical Requirements Document
**Version:** 2.0  
**Product:** Cloud-Based Textile Supply Chain ERP & Traceability Platform  
**Date:** April 2026  
**Classification:** Internal Engineering Reference

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Functional Requirements](#5-functional-requirements)
6. [API Requirements](#6-api-requirements)
7. [Data Architecture Requirements](#7-data-architecture-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Performance Requirements](#9-performance-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Integration Requirements](#11-integration-requirements)
12. [Infrastructure Requirements](#12-infrastructure-requirements)
13. [Migration Plan](#13-migration-plan)
14. [Compliance Requirements](#14-compliance-requirements)
15. [Testing Requirements](#15-testing-requirements)

---

## 1. Product Overview

### 1.1 Problem Statement

Textile brands have no reliable way to verify what happens in their supply chain between placing a purchase order and receiving finished garments. Sustainability claims are unverifiable. Compliance failures go undetected until audits. Production delays are discovered too late. Supply chain data lives in spreadsheets, WhatsApp messages, and email threads.

TextileTrace replaces all of that with a single platform that connects every participant in the supply chain — brands, manufacturers, auditors — and creates an immutable, verifiable record of every transaction from raw fiber to finished garment.

### 1.2 What the Product Does

- A Brand places Purchase Orders on Manufacturers and tracks production, quality, compliance, and delivery in real time
- A Manufacturer receives POs, manages production, uploads reports, and builds a verifiable factory profile
- An Auditor independently verifies transactions, approves batches, and assesses compliance
- An Admin manages the platform, approves new users, and monitors system health
- A Consumer scans a QR code on a garment and sees the full verified supply chain story

### 1.3 Supply Chain Model

```
Raw Fiber → Spinning Mill (Yarn) → Weaving Mill (Fabric) → Dyeing House → Cut & Sew Factory → Brand → Consumer
   Tier 3        Tier 3               Tier 2                 Tier 2           Tier 1
```

Each stage is tracked as a node in the traceability graph. Every material movement between stages is a recorded event.

### 1.4 Core Value Propositions

| Value | Description |
|---|---|
| Immutable Audit Trail | Every action, status change, and document upload is permanently recorded |
| Real-Time Visibility | Brands see production status, quality metrics, and shipment location as it happens |
| Compliance Automation | Certification expiry, document verification, and alert generation are automatic |
| Consumer Transparency | Public QR scan page shows verified supply chain to end consumers |
| Analytics Intelligence | Power BI-style dashboards with supplier performance, quality trends, delivery analysis |

---

## 2. Technology Stack

### 2.1 Recommended Stack (Target Architecture)

#### Frontend
| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| Next.js | 14 (App Router) | Web framework | SSR for consumer QR pages; CSR for dashboards; CRA is abandoned |
| TypeScript | 5.x | Type safety | Catches type mismatches between frontend and API at compile time |
| Tailwind CSS | 3.x | Styling | Utility-first, consistent design system, already in use |
| shadcn/ui | Latest | UI components | Accessible, unstyled by default, already in use |
| TanStack Query | 5.x | Data fetching | Caching, background refetch, deduplication — replaces raw useEffect+axios |
| Apache ECharts | 5.x | Charts & dashboards | Canvas-based, handles 1M+ data points; Recharts SVG freezes at scale |
| Socket.io Client | 4.x | Real-time updates | Push live production/shipment status without polling |
| React Native + Expo | SDK 51 | Mobile app | Factory floor QR scanning, offline support, OTA updates |

#### Backend
| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| NestJS | 10.x | Core API framework | TypeScript end-to-end with frontend; enforced module structure for ERP complexity |
| GraphQL (Apollo Server) | 4.x | API layer | Complex nested queries (PO → Season → Supplier → Batch) in one request |
| Python FastAPI | 0.110+ | Data & ML service | Python is irreplaceable for Pandas, NumPy, scikit-learn analytics |
| Go | 1.22 | Event ingestion service | 80k req/sec throughput for QR scan spikes during factory audits |
| Celery | 5.x | Background job queue | Report generation, bulk PO creation, emails must not block HTTP |
| Socket.io Server | 4.x | Real-time server | WebSocket management for live dashboard updates |

#### Databases
| Technology | Purpose | Why This Choice |
|---|---|---|
| PostgreSQL 16 (Supabase) | Primary transactional data | ACID, foreign key integrity, Row Level Security for multi-tenancy |
| Neo4j AuraDB | Supply chain traceability graph | Graph traversal at 7+ tiers is constant-time; SQL degrades exponentially |
| ClickHouse Cloud | Analytics & dashboards | Columnar, 100x faster than PostgreSQL for aggregation queries |
| Redis (Upstash) | Cache + Pub/Sub | Sub-millisecond cache reads; Pub/Sub for WebSocket event distribution |
| Kafka (Upstash → Confluent) | Event streaming | Immutable append-only event log; legally defensible audit trail |
| Elasticsearch | Search | Fuzzy supplier/document search at 100k+ records |

#### Infrastructure
| Technology | Purpose | Why This Choice |
|---|---|---|
| AWS | Cloud provider | Most regions (data residency), best managed service catalog, compliance ready |
| Vercel | Frontend hosting | Native Next.js deployment, edge network, zero config |
| Railway | Backend hosting (early stage) | Deploy NestJS + Celery from same repo, simpler than ECS at start |
| AWS ECS Fargate | Backend hosting (scale) | Containerized, auto-scaling, no server management |
| AWS S3 + CloudFront | File storage + CDN | Already using Boto3; CDN for document/certificate delivery globally |
| Clerk | Authentication | Multi-tenant organisations, SAML SSO for enterprise brands, 10k MAU free |
| Grafana Cloud | Monitoring | Free tier observability: metrics, logs, traces |
| GitHub Actions | CI/CD | Deploy to Vercel, Railway, AWS from pull requests |

### 2.2 Current Stack (What Exists Today)

| Layer | Current | Status |
|---|---|---|
| Frontend | React 19 + CRA | Must migrate — CRA is abandoned |
| Backend | Python FastAPI | Keep for data/ML; replace with NestJS for API |
| Database | MongoDB | Replace with PostgreSQL for core data |
| Auth | Custom JWT + bcrypt | Replace with Clerk |
| Charts | Recharts | Replace with ECharts |
| Hosting | Vercel + Render | Keep Vercel; replace Render with Railway |
| Storage | AWS S3 + Boto3 | Keep |

### 2.3 Migration Priority Order

```
Phase 1 (Month 1-2):   PostgreSQL + Supabase  →  Fix data integrity now
                        Redis (Upstash)         →  Fix performance now
                        Clerk                   →  Fix auth before enterprise sales

Phase 2 (Month 2-3):   Next.js migration       →  Fix CRA, enable SSR
                        TanStack Query          →  Fix data fetching
                        Celery                  →  Fix blocking operations

Phase 3 (Month 4-6):   NestJS migration        →  Full-stack TypeScript
                        ClickHouse              →  Unlock real analytics
                        Neo4j                   →  Unlock real traceability

Phase 4 (Month 6-9):   Kafka                   →  Immutable audit trail
                        Elasticsearch           →  Production-grade search
                        React Native            →  Factory floor mobile

Phase 5 (Month 9+):    Go event service        →  High-throughput scale
                        AWS ECS                 →  Production infrastructure
                        GraphQL                 →  Unified API layer
```

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                        │
│                                                                      │
│  Next.js 14 (Web)                React Native + Expo (Mobile)       │
│  ├── Brand Dashboard             ├── QR Scanner                     │
│  ├── Manufacturer Portal         ├── Production Updates             │
│  ├── Auditor Interface           ├── Offline Queue                  │
│  ├── Admin Panel                 └── Push Notifications             │
│  └── Consumer QR Story (SSR)                                        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────▼─────────────────────────────────────────┐
│  API GATEWAY (AWS API Gateway + WAF)                                 │
│  Rate limiting · Auth verification · DDoS protection · SSL          │
└───┬──────────────────┬─────────────────────┬────────────────────────┘
    │                  │                     │
┌───▼──────────┐ ┌─────▼───────────┐ ┌──────▼──────────────┐
│  Core API    │ │  Analytics API  │ │  Event Ingestion    │
│  NestJS      │ │  Python FastAPI │ │  Go                 │
│  TypeScript  │ │  Pandas / NumPy │ │  50,000 req/sec     │
│  GraphQL     │ │  ML Models      │ │  QR scans           │
│  Socket.io   │ │  Sustainability │ │  Batch events       │
│  Celery      │ │  scoring        │ │  Shipment pings     │
└───┬──────────┘ └─────┬───────────┘ └──────┬──────────────┘
    │                  │                     │
    └──────────────────┴─────────────────────┘
                       │ Publish events
    ┌──────────────────▼──────────────────────┐
    │           Apache Kafka                   │
    │      Immutable Event Spine               │
    │  traceability · production · audits      │
    └──┬────────────┬────────────┬────────────┘
       │ Consume    │ Consume    │ Consume
┌──────▼──────┐ ┌───▼──────┐ ┌──▼───────────┐
│  Supabase   │ │ClickHouse│ │   Neo4j      │
│ PostgreSQL  │ │  Cloud   │ │  AuraDB      │
│             │ │          │ │              │
│ Users       │ │ Analytics│ │ Supply chain │
│ POs         │ │ Dashboards│ │ graph        │
│ Seasons     │ │ KPI trends│ │ Traceability │
│ Suppliers   │ │ Reports  │ │ traversal    │
│ Batches     │ └──────────┘ └──────────────┘
│ Audits      │
│ Shipments   │     ┌──────────────────────┐
└─────────────┘     │  Redis (Upstash)     │
                    │  Cache + Pub/Sub     │
                    │  Dashboard cache     │
                    │  WebSocket events    │
                    │  Rate limiting       │
                    └──────────────────────┘
                    ┌──────────────────────┐
                    │  Elasticsearch       │
                    │  Supplier search     │
                    │  Document search     │
                    │  PO search           │
                    └──────────────────────┘
                    ┌──────────────────────┐
                    │  AWS S3 + CloudFront │
                    │  Documents           │
                    │  Swatch images       │
                    │  Certificates        │
                    │  QR code assets      │
                    └──────────────────────┘
```

### 3.2 Service Boundaries

| Service | Owns | Does Not Own |
|---|---|---|
| Core API (NestJS) | Business logic, PO lifecycle, user management, auth | Analytics computation, ML models, raw event ingestion |
| Analytics API (Python) | Sustainability scoring, ML predictions, Pandas aggregations | Business logic, user state |
| Event Ingestion (Go) | High-throughput write path for QR scans and batch events | Any read queries, business logic |
| Celery Workers | Background jobs: reports, emails, bulk operations | Synchronous request handling |

### 3.3 Data Flow: Purchase Order Lifecycle

```
Brand creates PO
      │
      ▼
PostgreSQL (PO record written)
      │
      ▼
Kafka (PO_CREATED event published)
      │
      ├──► Neo4j (PO node added to supply chain graph)
      ├──► ClickHouse (PO added to analytics store)
      ├──► Celery (email notification to Manufacturer queued)
      └──► Socket.io (Brand dashboard updated live)

Manufacturer accepts PO
      │
      ▼
PostgreSQL (PO status updated)
      │
      ▼
Kafka (PO_ACCEPTED event)
      │
      ├──► ClickHouse (status change recorded in analytics)
      └──► Socket.io (Brand sees accepted status live)
```

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

| Role | Description | Count Expectation |
|---|---|---|
| Super Admin | Platform-level management, user approval, system monitoring | 1–5 per platform |
| Brand | Creates POs, tracks supply chain, manages seasons, views analytics | 1 per brand organisation |
| Brand Member | Brand employee with limited access (view only or specific modules) | Multiple per brand |
| Manufacturer | Receives POs, manages production, uploads reports, manages factory | 1 per factory |
| Auditor | Independent verification, batch approval, compliance assessment | Assigned per PO/batch |
| Consumer | Public QR scan user, no login required, read-only supply chain story | Anonymous |

### 4.2 Permission Matrix

| Resource | Admin | Brand | Manufacturer | Auditor | Consumer |
|---|---|---|---|---|---|
| User management | CRUD | — | — | — | — |
| Approve registrations | Yes | — | — | — | — |
| Create seasons | — | CRUD | — | — | — |
| Create mood boards | — | CRUD | — | — | — |
| Create collections | — | CRUD | — | — | — |
| Upload swatches | — | Read | CRUD | — | — |
| Create purchase orders | — | CRUD | Read | — | — |
| Accept / reject PO | — | — | Yes | — | — |
| Production reports | — | Read/Approve | CRUD | Read | — |
| Quality reports | — | Read/Approve | CRUD | Read | — |
| Traceability records | — | Read/Update | CRUD | Read/Verify | Read (public) |
| Compliance documents | — | Read/Verify | Upload | Verify | — |
| Audits | Read | Create/Read | Respond | CRUD | — |
| Shipment tracking | Read | Read | CRUD | Read | — |
| QR story page | — | — | — | — | Read |
| Analytics dashboards | Read (all) | Read (own) | Read (own) | — | — |
| Billing management | — | Own | Own | — | — |
| System alerts | CRUD | Read (own) | Read (own) | — | — |

### 4.3 Multi-Tenancy Rules

- Each Brand organisation is isolated. Brand A cannot see Brand B's POs, seasons, suppliers, or analytics under any circumstances
- Row Level Security in PostgreSQL enforces isolation at the database level, not just the application level
- Manufacturers see only POs addressed to them
- Auditors see only audits assigned to them
- Admin sees all data across all tenants
- All queries are automatically scoped by `organisation_id` from the JWT claim

---

## 5. Functional Requirements

### 5.1 Authentication & User Management

#### REQ-AUTH-001: User Registration
- Users register with: email, password, full name, company name, role selection, country
- All new registrations are in `pending_approval` status until Admin approves
- System sends email confirmation on registration
- System sends approval notification email when Admin approves

#### REQ-AUTH-002: Authentication
- JWT-based authentication with 24-hour access token expiry
- Refresh token with 30-day expiry stored in httpOnly cookie
- Failed login attempts: lock account after 5 consecutive failures for 30 minutes
- All tokens invalidated on password change

#### REQ-AUTH-003: Role-Based Access Control
- Every API endpoint is protected by role guard
- Route mismatch (Brand accessing Manufacturer endpoint) returns 403, never 404
- Middleware validates JWT on every request before any business logic runs

#### REQ-AUTH-004: Multi-Tenant Isolation
- Every database query appends `WHERE brand_id = :current_user_brand_id` automatically
- Supabase RLS policies enforce this at DB level as a safety net
- Cross-tenant data access generates a security alert logged to admin

#### REQ-AUTH-005: Enterprise SSO (via Clerk)
- Support SAML 2.0 for enterprise brand clients with corporate identity providers
- Support OAuth 2.0 (Google, Microsoft) for individual users
- Support magic link email authentication

---

### 5.2 Season Management Module

#### REQ-SEASON-001: Season CRUD
- Brand creates a season with: name, code (e.g., AW27), type (Autumn/Winter, Spring/Summer), year, launch date, target styles count, budget
- Season statuses: `planning` → `design` → `development` → `production` → `completed`
- Brand can archive seasons; archived seasons are read-only

#### REQ-SEASON-002: Season Dashboard
- KPIs per season: designs submitted, selected, pending review, selection rate, mood boards count
- Progress bar showing selected styles vs target
- All POs linked to a season are visible within season detail

#### REQ-SEASON-003: Mood Board Management
- Brand creates mood boards within a season
- Supports image uploads (JPEG, PNG, WebP up to 10MB per image)
- Images stored in AWS S3, served via CloudFront CDN
- Multiple mood boards per season, each with title, theme, colour palette tags

#### REQ-SEASON-004: Design Management
- Designers submit designs against a season
- Design metadata: category, fabric type, target supplier, CAD file, reference images
- Brand can bulk select/reject designs with comments
- Duplicate design detection alerts when similar designs are submitted by different suppliers

---

### 5.3 Manufacturer Collection & Swatch Module

#### REQ-SWATCH-001: Collection Creation
- Brand creates a fabric collection linked to a season
- Collection has: name, deadline, max swatches per supplier, guidelines, invited manufacturers list
- System emails invited manufacturers when collection is opened

#### REQ-SWATCH-002: Swatch Upload (Manufacturer)
- Manufacturer uploads swatches via drag-and-drop interface
- Per-swatch metadata: fabric type, weave type, GSM, composition (% breakdown), color, pattern, certifications (GOTS, OEKO-TEX, etc.), price per meter, MOQ, lead time
- Bulk CSV upload with metadata + image folder upload supported
- Images auto-resized to thumbnail (400px) and full-size (1200px) and stored in S3
- Max 500 swatches per manufacturer per collection

#### REQ-SWATCH-003: Swatch Review (Brand)
- Pinterest-style masonry grid with advanced filters: fabric type, weave, GSM range, certification, status, supplier
- Swatch detail modal with full metadata, certification badges, supplier info
- Bulk actions: shortlist, select, reject (with rejection reason)
- Duplicate detection: alert when two swatches from different suppliers are visually similar (>85% similarity score)
- Status flow: `uploaded` → `viewed` → `shortlisted` → `selected` | `rejected`

---

### 5.4 Purchase Order Management Module

#### REQ-PO-001: PO Creation (Brand)
- Brand creates PO with: PO number (auto-generated or manual), manufacturer, season, line items (style, quantity, unit price, colour, size breakdown), delivery date, destination, shipping terms (FOB/CIF/EXW), payment terms, special instructions
- System generates unique PO number format: `PO-{BRAND_CODE}-{YEAR}-{SEQUENCE}`
- PO value auto-calculated from line items

#### REQ-PO-002: PO Lifecycle
- Statuses: `draft` → `sent` → `acknowledged` → `in_production` → `qc_passed` → `shipped` → `delivered` → `closed` | `cancelled`
- Every status change is recorded with timestamp, actor, and reason
- Status regressions are not allowed (cannot go from `shipped` back to `in_production`)

#### REQ-PO-003: PO Acceptance (Manufacturer)
- Manufacturer receives PO notification (email + in-app)
- Can accept or reject with mandatory reason for rejection
- Can request PO amendment (triggers Brand notification)
- Accepted POs automatically transition to `acknowledged` status

#### REQ-PO-004: PO Analytics
- Brand-level stats: total PO value, active POs, delayed POs, completion rate by manufacturer
- PO-level stats: production progress %, days to delivery, estimated vs actual quantity
- Season-level aggregation: total PO value per season, average lead time

---

### 5.5 Production & Quality Reports Module

#### REQ-REPORT-001: Daily Production Reports (DPR)
- Manufacturer submits DPR with: date, PO reference, style, operator count, planned quantity, actual quantity, WIP, cumulative totals
- System auto-calculates: efficiency % = (actual / planned) × 100
- Alert generated when efficiency < 70% for 3 consecutive days
- DPR must be submitted by 6:00 PM daily for active production POs

#### REQ-REPORT-002: Daily Quality Reports (DQR)
- Manufacturer submits DQR with: date, checked quantity, defect table (defect type, count, severity: minor/major/critical), DHU%, rejection rate
- DHU (Defects per Hundred Units) = (total defects / checked quantity) × 100
- Alert generated when DHU > 5%
- Alert generated when critical defects > 0

#### REQ-REPORT-003: Inspection Reports
- AQL (Acceptable Quality Level) inspection reports
- AQL levels: 1.0 / 2.5 / 4.0
- Results: PASS / FAIL / CONDITIONAL
- Mandatory photo attachments for FAIL results
- Brand receives immediate notification on FAIL result

#### REQ-REPORT-004: Fabric & Trim Test Reports
- Fabric tests: GSM, shrinkage (warp/weft), colour fastness (wash/rub/light), pilling, tear strength
- Trim tests: button pull strength, zipper function, label wash test
- Lab name, accreditation number, and test date are mandatory fields
- Documents scanned as PDF/image uploaded to S3

#### REQ-REPORT-005: Report Approval Workflow
- Brand reviews and approves/rejects each report
- Rejection requires written reason
- Approved reports count toward traceability score
- Timeline view shows all reports chronologically with colour-coded dots

#### REQ-REPORT-006: Missing Report Detection
- System detects production days where DPR or DQR was not submitted
- Generates missing report alert for each missing date
- Brand dashboard highlights POs with report gaps

---

### 5.6 Traceability Module

#### REQ-TRACE-001: Supply Chain Stage Tracking
- Tracks 5 stages: Fiber Origin → Yarn Production → Fabric Manufacturing → Garment Production → Dispatch
- Each stage records: supplier name, location, certifications, dates, quantities, documents
- Stage completion contributes to traceability score:
  - Fiber: 20 points
  - Yarn: 20 points
  - Fabric: 20 points
  - Garment: 20 points
  - Dispatch: 20 points

#### REQ-TRACE-002: Tier-Wise Supplier Mapping
- Tier 1: Direct manufacturer (cut & sew)
- Tier 2: Fabric/dyeing suppliers
- Tier 3: Yarn/fiber suppliers
- Each tier supplier has: company name, country, address, certifications, contact person
- New tier suppliers require document verification before traceability score is credited

#### REQ-TRACE-003: Material Tracking
- Material details per PO: composition (cotton%, polyester%, etc.), GSM, certifications (GOTS, OEKO-TEX, BCI, etc.), origin country
- Material provenance chain is queryable: "show all materials in garment G001 and their origins"
- Certification expiry tracking with 60-day advance alerts

#### REQ-TRACE-004: Traceability Score Calculation
- Automatic score 0–100% based on completeness of stage data + document verification
- Score components: stage completion (40%), document verification (30%), certification validity (20%), supplier mapping (10%)
- Score displayed as colour-coded badge: Green (80–100%), Yellow (50–79%), Red (0–49%)

#### REQ-TRACE-005: Consumer QR Story Page
- Every PO and every garment batch has a unique QR code
- QR links to public `/story/:qr_code` page — no login required
- Page shows: brand name, garment details, supply chain stages with country flags, certifications with logos, sustainability metrics
- Page is server-side rendered (Next.js SSR) for fast load on mobile networks
- Page loads in < 1.5 seconds on 3G connection

#### REQ-TRACE-006: Graph Traversal (Neo4j)
- Complete upstream trace from any garment back to raw material origin
- Query: given garment batch ID, return all suppliers, materials, and certifications in the chain
- Query returns in < 200ms regardless of chain depth
- Visualised as interactive network graph in the frontend (TraceabilityTree / TraceabilityFlow pages)

---

### 5.7 Incoming & Dispatch Module

#### REQ-INCOMING-001: Invoice Management
- Manufacturer creates invoice against a PO with: invoice number, line items, quantities, unit values, total value, destination
- Invoice statuses: `draft` → `issued` → `in_transit` → `partially_delivered` → `delivered`
- Multiple invoices allowed per PO (partial shipments)

#### REQ-INCOMING-002: Dispatch Tracking
- Dispatch records: vehicle number, driver name, transporter company, dispatch date, GPS origin/destination coordinates
- Real-time GPS tracking with location history stored
- Brand sees live map with current vehicle position (Leaflet / Mapbox)
- Estimated arrival calculated using Haversine formula

#### REQ-INCOMING-003: Delivery Alerts
- Automatic HIGH alert when delivery is > 24 hours past expected arrival
- Automatic alert for partial deliveries (received quantity ≠ dispatched quantity)
- Alert for stuck shipments (no GPS update for > 6 hours while in transit)

#### REQ-INCOMING-004: Document Management per Dispatch
- Mandatory documents: packing list, commercial invoice
- Optional: e-Way bill, challan, certificate of origin
- Documents uploaded as PDF, stored in S3, accessible to both Brand and Manufacturer

#### REQ-INCOMING-005: Analytics
- Delivery performance: on-time rate %, average delay hours, average transit time
- Supplier logistics ranking: top performers by on-time delivery rate
- Distance vs delivery time correlation analysis
- All available as charts in the Incoming Dashboard

---

### 5.8 Supply Chain Command Center

#### REQ-CMD-001: Supplier Dashboard
- Power BI-style dashboard per supplier, filterable by season
- KPI cards: Total POs, Production %, Quality Score, On-Time Delivery %, Compliance %, Active Alerts
- All KPIs colour-coded: Green (above target), Yellow (approaching threshold), Red (below threshold)

#### REQ-CMD-002: Seven Dashboard Tabs
- **Overview**: PO status distribution (pie), production trend (area chart), quality trend (bar), delivery performance grid, recent alerts
- **Production**: Overall progress bar, target vs actual totals, WIP, daily output trend, production by PO breakdown
- **Quality**: Quality score, average DHU, defect count, DHU trend line chart, defect breakdown by type, quality by PO
- **Delivery**: Total deliveries, on-time rate, average delay, pending, weekly delivery performance bar chart
- **Compliance**: Traceability score, compliance score, completion rate, certified POs, risk indicators, traceability by PO
- **Reports**: Total, pending, approved, rejected counts; reports by type breakdown
- **Alerts**: Active alerts list with severity badges (Critical/High/Medium/Low), link to PO

#### REQ-CMD-003: Drill-Down Navigation
- Every chart data point and KPI links to the underlying detail page
- PO status in Command Center → PO Traceability Detail page
- Alert in Command Center → specific alert's source PO page

---

### 5.9 Audit Management Module

#### REQ-AUDIT-001: Audit Creation
- Brand or Admin creates an audit request for a specific manufacturer
- Audit types: social compliance, environmental, quality, full scope
- Assigned to specific Auditor with deadline
- System notifies both Manufacturer and Auditor

#### REQ-AUDIT-002: Audit Response (Manufacturer)
- Manufacturer submits responses to audit checklist items
- Can attach supporting documents per checklist item
- Status: `pending` → `in_progress` → `submitted` → `under_review` → `completed`

#### REQ-AUDIT-003: Audit Assessment (Auditor)
- Auditor reviews all manufacturer responses and documents
- Rates each item: Compliant / Non-Compliant / Partially Compliant
- Writes corrective action plan for non-compliant items
- Generates final audit score and compliance certificate

#### REQ-AUDIT-004: Audit History
- Full audit history per manufacturer
- Trend analysis: compliance score over time
- Overdue audit alerts

---

### 5.10 Billing & Subscription Module

#### REQ-BILLING-001: Subscription Plans (Brand)
| Plan | Monthly Price | Offer Price | Annual Price | Offer Annual |
|---|---|---|---|---|
| Starter | $79/mo | $49/mo (38% off) | $948/yr | $490/yr |
| Professional | $249/mo | $149/mo (40% off) | $2,988/yr | $1,490/yr |
| Enterprise | 2% of PO value | 1.5% of PO value | — | — |

#### REQ-BILLING-002: Subscription Plans (Manufacturer)
| Plan | Monthly Price | Offer Price | Annual Price | Offer Annual |
|---|---|---|---|---|
| Basic | $49/mo | $29/mo (41% off) | $588/yr | $290/yr |
| Professional | $129/mo | $79/mo (39% off) | $1,548/yr | $790/yr |
| Pay-Per-Order | 5% per order | 3% per order | — | — |

#### REQ-BILLING-003: Trial
- 14-day free trial on all paid plans
- No credit card required for trial initiation
- Reminder emails at day 10 and day 13 of trial

#### REQ-BILLING-004: Billing Dashboard
- Current plan, next billing date, billing history, invoice download
- Usage metrics: POs this month, active suppliers
- Plan upgrade/downgrade with immediate prorated adjustment
- Cancel anytime with service through end of billing period

---

### 5.11 Admin Module

#### REQ-ADMIN-001: User Approval Workflow
- New registrations appear in Admin pending queue
- Admin reviews company details, role, country before approving
- Rejection with reason sent to applicant via email
- Bulk approve/reject supported

#### REQ-ADMIN-002: Platform Monitoring
- Total users by role, active sessions, new registrations this week
- Manufacturer risk distribution (Low / Medium / High risk)
- System-wide batch status overview
- All alerts across all tenants

#### REQ-ADMIN-003: Manufacturer Risk Management
- Risk categories: Low / Medium / High based on compliance score, audit results, late delivery frequency
- Admin can manually lock a high-risk manufacturer (prevents new PO acceptance)
- Risk score auto-calculated weekly from: compliance score (40%), on-time delivery (30%), audit results (30%)

---

## 6. API Requirements

### 6.1 API Design Standards

- All APIs are versioned: `/api/v1/`, `/api/v2/`
- GraphQL endpoint at `/graphql` for complex queries
- REST endpoints for simple CRUD at `/api/v1/`
- All responses use consistent envelope: `{ data, meta, errors }`
- All dates in ISO 8601 format (UTC): `2026-04-25T10:30:00Z`
- Pagination: cursor-based for large collections, page-based for simple lists
- All list endpoints support: `limit`, `cursor/page`, `sort_by`, `sort_order`, `search`, `filters`

### 6.2 Response Envelope

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-04-25T10:30:00Z",
    "pagination": {
      "total": 250,
      "page": 1,
      "per_page": 20,
      "next_cursor": "cursor_xyz"
    }
  },
  "errors": null
}
```

### 6.3 Error Response

```json
{
  "data": null,
  "meta": { "request_id": "req_abc123" },
  "errors": [
    {
      "code": "PO_NOT_FOUND",
      "message": "Purchase order PO-BRAND-2026-001 does not exist",
      "field": null,
      "documentation_url": "https://docs.textiletrace.com/errors/PO_NOT_FOUND"
    }
  ]
}
```

### 6.4 Complete API Endpoint Reference

#### Authentication
```
POST   /api/v1/auth/register              Register new user
POST   /api/v1/auth/login                 Login, receive JWT + refresh token
POST   /api/v1/auth/logout                Invalidate tokens
POST   /api/v1/auth/refresh               Refresh access token
GET    /api/v1/auth/me                    Get current user profile
PUT    /api/v1/auth/me                    Update profile
POST   /api/v1/auth/change-password       Change password
POST   /api/v1/auth/forgot-password       Send reset email
POST   /api/v1/auth/reset-password        Reset via token
```

#### Users (Admin only)
```
GET    /api/v1/users                      List all users (paginated)
GET    /api/v1/users/:id                  Get user by ID
PUT    /api/v1/users/:id                  Update user
DELETE /api/v1/users/:id                  Deactivate user
POST   /api/v1/users/:id/approve          Approve pending registration
POST   /api/v1/users/:id/reject           Reject with reason
GET    /api/v1/users/pending              List pending approvals
```

#### Seasons
```
GET    /api/v1/seasons                    List seasons (brand-scoped)
POST   /api/v1/seasons                    Create season
GET    /api/v1/seasons/:id                Get season details
PUT    /api/v1/seasons/:id                Update season
DELETE /api/v1/seasons/:id                Archive season
GET    /api/v1/seasons/:id/stats          Season statistics
GET    /api/v1/seasons/:id/mood-boards    List mood boards
POST   /api/v1/seasons/:id/mood-boards    Create mood board
GET    /api/v1/seasons/:id/designs        List designs
POST   /api/v1/seasons/:id/designs        Submit design
PUT    /api/v1/seasons/:id/designs/select Bulk select/reject designs
```

#### Manufacturer Collections & Swatches
```
GET    /api/v1/collections                List collections
POST   /api/v1/collections                Create collection
GET    /api/v1/collections/:id            Get collection detail
PUT    /api/v1/collections/:id            Update collection
POST   /api/v1/collections/:id/invite     Invite manufacturers
GET    /api/v1/collections/:id/swatches   List swatches (with filters)
POST   /api/v1/collections/:id/swatches   Upload swatch
POST   /api/v1/collections/:id/swatches/bulk Bulk upload swatches
PUT    /api/v1/collections/:id/swatches/select Bulk shortlist/select/reject
GET    /api/v1/collections/:id/analytics  Collection analytics
GET    /api/v1/collections/:id/duplicates Duplicate swatch detection
```

#### Purchase Orders
```
GET    /api/v1/purchase-orders            List POs (role-scoped)
POST   /api/v1/purchase-orders            Create PO
GET    /api/v1/purchase-orders/:id        Get PO details
PUT    /api/v1/purchase-orders/:id        Update PO (draft only)
GET    /api/v1/purchase-orders/stats      PO statistics
POST   /api/v1/purchase-orders/:id/accept Manufacturer accepts PO
POST   /api/v1/purchase-orders/:id/reject Manufacturer rejects PO
PUT    /api/v1/purchase-orders/:id/status Update PO status
GET    /api/v1/purchase-orders/:id/history PO status change history
```

#### Reports
```
GET    /api/v1/reports/po/:poId           PO reports summary
GET    /api/v1/reports/po/:poId/analytics Charts data
GET    /api/v1/reports/po/:poId/timeline  Chronological reports
GET    /api/v1/reports/po/:poId/enhanced-summary Enhanced summary with alerts
GET    /api/v1/reports/po/:poId/supplier-performance Supplier metrics
GET    /api/v1/reports/po/:poId/missing-dates Missing report dates

POST   /api/v1/reports/production         Create Daily Production Report
GET    /api/v1/reports/production/:id     Get DPR
PUT    /api/v1/reports/production/:id     Update DPR (if not approved)
POST   /api/v1/reports/quality            Create Daily Quality Report
GET    /api/v1/reports/quality/:id        Get DQR
POST   /api/v1/reports/inspection         Create Inspection Report
POST   /api/v1/reports/fabric-tests       Create Fabric Test Report
POST   /api/v1/reports/trims              Create Trims Report
POST   /api/v1/reports/:type/:id/approve  Approve report (Brand)
POST   /api/v1/reports/upload             Upload report attachment

GET    /api/v1/reports/alerts             Active alerts
POST   /api/v1/reports/alerts/:id/resolve Resolve alert
```

#### Traceability
```
GET    /api/v1/traceability/stats/overview   Overall stats
GET    /api/v1/traceability/po/:poId         Get/create traceability record
PUT    /api/v1/traceability/po/:poId/supply-chain Update supply chain stages
PUT    /api/v1/traceability/po/:poId/suppliers    Update tier-wise suppliers
PUT    /api/v1/traceability/po/:poId/materials    Update material details
POST   /api/v1/traceability/po/:poId/documents    Upload document
POST   /api/v1/traceability/po/:poId/documents/:docId/verify Verify document
GET    /api/v1/traceability/season/:seasonId      Season traceability stats
GET    /api/v1/traceability/season/:seasonId/pos  POs with traceability status
GET    /api/v1/traceability/qr/:qrCode            Public QR story data (no auth)
GET    /api/v1/traceability/alerts                Active alerts
POST   /api/v1/traceability/alerts/:id/resolve    Resolve alert
```

#### Incoming & Dispatch
```
GET    /api/v1/incoming/dashboard/overview       Brand dashboard stats
GET    /api/v1/incoming/dashboard/pos            POs with shipment summaries
GET    /api/v1/incoming/po/:poId/summary         Complete PO incoming summary
GET    /api/v1/incoming/po/:poId/invoices        Invoices for a PO
GET    /api/v1/incoming/po/:poId/dispatches      Dispatches for a PO
POST   /api/v1/incoming/invoices                 Create invoice
GET    /api/v1/incoming/invoices/:id             Get invoice
POST   /api/v1/incoming/dispatches               Create dispatch
PUT    /api/v1/incoming/dispatches/:id/tracking  Update GPS location
POST   /api/v1/incoming/dispatches/:id/receive   Mark as received
POST   /api/v1/incoming/dispatches/:id/documents Upload dispatch documents
GET    /api/v1/incoming/alerts                   Active incoming alerts
POST   /api/v1/incoming/alerts/:id/resolve       Resolve alert
GET    /api/v1/incoming/analytics/delivery-performance Delivery analytics
GET    /api/v1/incoming/analytics/supplier-logistics   Supplier rankings
```

#### Supply Chain Command Center
```
GET    /api/v1/command-center/suppliers                    Supplier list
GET    /api/v1/command-center/supplier/:id/overview        PO overview
GET    /api/v1/command-center/supplier/:id/production      Production metrics
GET    /api/v1/command-center/supplier/:id/quality         Quality metrics
GET    /api/v1/command-center/supplier/:id/delivery        Delivery performance
GET    /api/v1/command-center/supplier/:id/compliance      Compliance & traceability
GET    /api/v1/command-center/supplier/:id/reports         Reports summary
GET    /api/v1/command-center/supplier/:id/alerts          Active alerts
GET    /api/v1/command-center/supplier/:id/kpis            Combined KPI summary
```

#### Suppliers / Manufacturers
```
GET    /api/v1/suppliers                    List manufacturers
POST   /api/v1/suppliers                    Create/register manufacturer
GET    /api/v1/suppliers/:id                Get manufacturer profile
PUT    /api/v1/suppliers/:id                Update profile
GET    /api/v1/suppliers/stats              Platform-wide stats (Admin)
POST   /api/v1/suppliers/:id/activate       Activate (Admin)
POST   /api/v1/suppliers/:id/deactivate     Deactivate (Admin)
POST   /api/v1/suppliers/:id/lock           Lock high-risk (Admin)
GET    /api/v1/suppliers/:id/performance    Performance metrics
```

#### Audits
```
GET    /api/v1/audits                    List audits (role-scoped)
POST   /api/v1/audits                    Create audit request
GET    /api/v1/audits/:id                Get audit details
PUT    /api/v1/audits/:id                Update audit
GET    /api/v1/audits/assigned           Auditor's assigned audits
POST   /api/v1/audits/:id/submit         Submit manufacturer response
POST   /api/v1/audits/:id/assess         Auditor submits assessment
GET    /api/v1/audits/:id/report         Download audit report PDF
```

#### Dashboard
```
GET    /api/v1/dashboard/admin           Admin overview stats
GET    /api/v1/dashboard/brand           Brand overview stats
GET    /api/v1/dashboard/manufacturer    Manufacturer overview stats
GET    /api/v1/dashboard/auditor         Auditor overview stats
```

---

## 7. Data Architecture Requirements

### 7.1 PostgreSQL — Schema Design

#### Core Tables

```sql
-- Multi-tenancy: every table has organisation_id
-- Row Level Security enforces brand isolation at DB level

organisations
  id UUID PRIMARY KEY
  name TEXT NOT NULL
  type TEXT CHECK(type IN ('brand','manufacturer','platform'))
  country TEXT
  subscription_plan TEXT
  subscription_status TEXT
  created_at TIMESTAMPTZ

users
  id UUID PRIMARY KEY
  organisation_id UUID REFERENCES organisations(id)
  email TEXT UNIQUE NOT NULL
  full_name TEXT
  role TEXT CHECK(role IN ('admin','brand','manufacturer','auditor'))
  status TEXT CHECK(status IN ('pending','active','inactive','locked'))
  created_at TIMESTAMPTZ

seasons
  id UUID PRIMARY KEY
  brand_id UUID REFERENCES organisations(id)
  code TEXT NOT NULL          -- e.g., AW27
  type TEXT                   -- Autumn/Winter, Spring/Summer
  year INTEGER
  launch_date DATE
  target_styles INTEGER
  budget NUMERIC
  status TEXT
  created_at TIMESTAMPTZ

purchase_orders
  id UUID PRIMARY KEY
  po_number TEXT UNIQUE NOT NULL
  brand_id UUID REFERENCES organisations(id)
  manufacturer_id UUID REFERENCES organisations(id)
  season_id UUID REFERENCES seasons(id)
  status TEXT NOT NULL
  total_value NUMERIC
  currency TEXT DEFAULT 'USD'
  delivery_date DATE
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ

po_line_items
  id UUID PRIMARY KEY
  po_id UUID REFERENCES purchase_orders(id)
  style_name TEXT
  colour TEXT
  quantity INTEGER
  unit_price NUMERIC
  size_breakdown JSONB

po_status_log
  id UUID PRIMARY KEY
  po_id UUID REFERENCES purchase_orders(id)
  from_status TEXT
  to_status TEXT NOT NULL
  changed_by UUID REFERENCES users(id)
  reason TEXT
  created_at TIMESTAMPTZ DEFAULT NOW()

production_reports
  id UUID PRIMARY KEY
  po_id UUID REFERENCES purchase_orders(id)
  manufacturer_id UUID REFERENCES organisations(id)
  report_date DATE NOT NULL
  planned_quantity INTEGER
  actual_quantity INTEGER
  efficiency_pct NUMERIC GENERATED ALWAYS AS
    (CASE WHEN planned_quantity > 0
     THEN (actual_quantity::NUMERIC / planned_quantity) * 100
     ELSE 0 END) STORED
  wip INTEGER
  status TEXT
  approved_by UUID REFERENCES users(id)
  approved_at TIMESTAMPTZ

quality_reports
  id UUID PRIMARY KEY
  po_id UUID REFERENCES purchase_orders(id)
  manufacturer_id UUID REFERENCES organisations(id)
  report_date DATE NOT NULL
  checked_quantity INTEGER
  total_defects INTEGER
  major_defects INTEGER
  minor_defects INTEGER
  critical_defects INTEGER
  dhu_pct NUMERIC GENERATED ALWAYS AS
    (CASE WHEN checked_quantity > 0
     THEN (total_defects::NUMERIC / checked_quantity) * 100
     ELSE 0 END) STORED
  defect_details JSONB
  status TEXT

traceability_records
  id UUID PRIMARY KEY
  po_id UUID REFERENCES purchase_orders(id) UNIQUE
  brand_id UUID REFERENCES organisations(id)
  supply_chain_stages JSONB
  tier_suppliers JSONB
  material_details JSONB
  traceability_score NUMERIC CHECK(traceability_score BETWEEN 0 AND 100)
  compliance_score NUMERIC CHECK(compliance_score BETWEEN 0 AND 100)
  status TEXT
  updated_at TIMESTAMPTZ
```

#### Row Level Security Policies

```sql
-- Brands only see their own POs
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_sees_own_pos" ON purchase_orders
  FOR ALL TO authenticated
  USING (
    brand_id = (SELECT organisation_id FROM users WHERE id = auth.uid())
    OR
    manufacturer_id = (SELECT organisation_id FROM users WHERE id = auth.uid())
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

### 7.2 Neo4j — Graph Schema

```cypher
// Nodes
(:Brand {id, name, country})
(:Manufacturer {id, name, country, tier})
(:Material {id, type, gsm, composition, certification})
(:PurchaseOrder {id, po_number, status, value})
(:Batch {id, batch_number, quantity})
(:Garment {id, qr_code, style})

// Relationships
(brand)-[:PLACED_ORDER]->(po)
(po)-[:ASSIGNED_TO]->(manufacturer)
(manufacturer)-[:PRODUCED]->(batch)
(batch)-[:CONTAINS]->(garment)
(batch)-[:USED_MATERIAL]->(material)
(material)-[:SOURCED_FROM]->(manufacturer)
(manufacturer)-[:SUPPLIED_BY {tier: 2}]->(manufacturer)

// Core traceability query
MATCH path = (g:Garment {qr_code: $qrCode})<-[:CONTAINS]-(b:Batch)
  <-[:PRODUCED]-(m:Manufacturer)
  -[:SUPPLIED_BY*0..5]->(upstream:Manufacturer)
RETURN path
```

### 7.3 ClickHouse — Analytics Tables

```sql
-- Append-only production events
CREATE TABLE production_events (
  event_id     UUID,
  po_id        UUID,
  brand_id     UUID,
  supplier_id  UUID,
  season_id    UUID,
  report_date  Date,
  planned_qty  UInt32,
  actual_qty   UInt32,
  efficiency   Float32,
  wip          UInt32,
  ingested_at  DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(report_date)
ORDER BY (brand_id, supplier_id, report_date);

-- Command center aggregation (materialised)
CREATE MATERIALIZED VIEW supplier_daily_kpis
ENGINE = AggregatingMergeTree()
ORDER BY (brand_id, supplier_id, report_date) AS
SELECT
  brand_id,
  supplier_id,
  report_date,
  sumState(actual_qty) AS total_produced,
  avgState(efficiency) AS avg_efficiency
FROM production_events
GROUP BY brand_id, supplier_id, report_date;
```

### 7.4 Kafka — Event Topics

| Topic | Producers | Consumers | Retention |
|---|---|---|---|
| `po.lifecycle` | Core API | ClickHouse sink, Neo4j sink, Notification service | Forever |
| `production.reports` | Core API | ClickHouse sink, Alert engine | 1 year |
| `quality.reports` | Core API | ClickHouse sink, Alert engine | 1 year |
| `traceability.events` | Core API, Event service | Neo4j sink, Audit log | Forever |
| `qr.scans` | Event service (Go) | ClickHouse sink, Analytics | 1 year |
| `shipment.tracking` | Event service (Go) | ClickHouse sink, Alert engine | 6 months |
| `alerts.generated` | Alert engine | Notification service | 90 days |

### 7.5 Redis — Key Patterns

```
command_center:{brand_id}:{supplier_id}          TTL: 5 min
dashboard:brand:{brand_id}                       TTL: 2 min
dashboard:manufacturer:{org_id}                  TTL: 2 min
po:details:{po_id}                               TTL: 10 min
session:{user_id}                                TTL: 24 hours
rate_limit:{api_key}:{minute_bucket}             TTL: 60 sec
ws:channel:brand:{brand_id}                      (Pub/Sub channel, no TTL)
ws:channel:po:{po_id}                            (Pub/Sub channel, no TTL)
```

### 7.6 File Storage (S3)

```
s3://textiletrace-prod/
├── swatches/
│   ├── originals/{organisation_id}/{swatch_id}/original.jpg
│   └── thumbnails/{organisation_id}/{swatch_id}/thumb_400.jpg
├── documents/
│   ├── certifications/{organisation_id}/{cert_id}/{filename}
│   ├── po-attachments/{po_id}/{filename}
│   └── audit-documents/{audit_id}/{filename}
├── reports/
│   └── generated/{brand_id}/{report_id}/report.pdf
└── qr-codes/
    └── {po_id}/{garment_id}/qr.png
```

---

## 8. Security Requirements

### 8.1 Authentication Security

- Passwords hashed with bcrypt, minimum cost factor 12
- JWT signed with RS256 (RSA asymmetric signing), not HS256
- Access tokens expire in 15 minutes (short-lived)
- Refresh tokens expire in 30 days, stored httpOnly cookie, rotated on each use
- Account locked after 5 failed login attempts for 30 minutes
- All token invalidations (logout, password change) propagate to Redis blacklist

### 8.2 Transport Security

- All traffic over HTTPS/TLS 1.3
- HSTS header enforced: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Certificate pinning in the mobile app
- All S3 bucket policies: `Block all public access` (files served only via signed CloudFront URLs)

### 8.3 API Security

- All endpoints require valid JWT (except `/auth/login`, `/auth/register`, `/traceability/qr/:qrCode`)
- Rate limiting per API key: 1,000 requests/minute for standard, 10,000 for enterprise
- Request validation via Pydantic/Zod — reject any unexpected fields, never pass raw request body to database
- SQL injection: impossible by design — always use parameterised queries (SQLAlchemy / Prisma), never string concatenation
- All file uploads: virus scan via AWS GuardDuty before storing; validate MIME type server-side, not client-side
- CORS: whitelist of allowed origins only, no wildcard in production

### 8.4 Data Security

- All data encrypted at rest: AES-256 (AWS RDS encryption, S3 SSE-S3)
- Database credentials in AWS Secrets Manager, rotated every 90 days, never in environment variables or code
- PII (user emails, company names) encrypted at column level using pgcrypto for GDPR compliance
- Data deletion: GDPR right-to-erasure implemented — user deletion anonymises PII but preserves supply chain integrity records (they're evidence)

### 8.5 Multi-Tenant Isolation

- Row Level Security enforced at PostgreSQL level (not just application level)
- Every API test suite includes a cross-tenant access test that must return 403
- Penetration test required before each major release
- Security audit log: every cross-tenant access attempt alerts the admin in real time

### 8.6 Immutable Audit Trail

- Every data-mutating operation (create, update, delete) writes an immutable event to Kafka
- Kafka retention: indefinite for traceability events, 1 year minimum for all other events
- Activity log table in PostgreSQL is insert-only — no UPDATE or DELETE permissions granted to application user
- Audit log format: `{ event_id, timestamp, actor_id, action, entity_type, entity_id, before_state, after_state }`

---

## 9. Performance Requirements

### 9.1 Response Time Targets

| Endpoint Type | Target P50 | Target P95 | Target P99 |
|---|---|---|---|
| Auth (login/register) | < 200ms | < 500ms | < 1s |
| Simple CRUD (GET single record) | < 100ms | < 300ms | < 500ms |
| List endpoints (paginated) | < 200ms | < 500ms | < 1s |
| Dashboard overview | < 500ms | < 1s | < 2s |
| Command Center (analytics) | < 800ms | < 1.5s | < 3s |
| Traceability graph traversal (Neo4j) | < 200ms | < 500ms | < 1s |
| File upload (< 10MB) | < 2s | < 5s | < 10s |
| QR story page (Next.js SSR) | < 1s | < 1.5s | < 2s |
| QR scan event ingestion (Go) | < 20ms | < 50ms | < 100ms |

### 9.2 Throughput Targets

| Scenario | Target |
|---|---|
| Concurrent dashboard users | 500 simultaneous |
| QR scan events per second | 5,000 peak (audit day) |
| Background jobs queue depth | < 1,000 jobs pending |
| WebSocket connections | 10,000 simultaneous |
| File uploads per hour | 10,000 |

### 9.3 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|---|---|---|---|
| Command Center dashboard | Redis | 5 minutes | On new report submitted |
| Brand dashboard overview | Redis | 2 minutes | On PO status change |
| Supplier list (for dropdowns) | Redis | 1 hour | On new supplier added |
| User profile | Redis | 15 minutes | On profile update |
| QR story page | CDN (CloudFront) | 24 hours | On traceability update |
| Swatch images (thumbnails) | CloudFront CDN | 365 days | On new upload only |

### 9.4 Database Optimisation Requirements

- All foreign key columns must have indexes
- Composite indexes on: `(brand_id, status)`, `(po_id, report_date)`, `(supplier_id, season_id)`
- ClickHouse partition key: `toYYYYMM(report_date)` for all time-series tables
- PostgreSQL connection pooling via PgBouncer (max 100 connections to DB, pool of 500 app connections)
- Slow query logging enabled: log all queries > 1 second
- Database EXPLAIN ANALYZE run on all new queries before production deployment

---

## 10. Non-Functional Requirements

### 10.1 Availability

- Uptime SLA: 99.9% (≤ 8.7 hours downtime per year)
- Planned maintenance windows: Sundays 2:00 AM – 4:00 AM UTC, maximum 2 hours
- Advance notice for maintenance: 72 hours minimum
- RTO (Recovery Time Objective): < 1 hour for any failure
- RPO (Recovery Point Objective): < 15 minutes data loss

### 10.2 Scalability

- Horizontal scaling: all backend services stateless, can add instances without coordination
- Database read replicas: PostgreSQL read replica for all dashboard/analytics queries
- Auto-scaling: services scale up when CPU > 70% for 3 consecutive minutes
- ClickHouse handles 10 billion rows without degradation
- Neo4j handles 1 billion graph relationships without traversal time increase

### 10.3 Reliability

- Retry logic on all external service calls (exponential backoff, max 3 retries)
- Circuit breaker pattern: if a downstream service fails, degrade gracefully rather than cascade
- Kafka consumer groups retry failed event processing up to 5 times before dead-letter queue
- Background jobs: Celery task retry with exponential backoff, max 3 retries, then alert admin

### 10.4 Maintainability

- Code coverage requirement: minimum 80% for all new backend code
- All new API endpoints must have integration tests before merge
- No direct database queries from components — all data access through service layer
- Every service has a `/health` endpoint returning `{ status, version, uptime, db_connected }`
- Structured logging (JSON format) on all services — logs shipped to Grafana Loki

### 10.5 Internationalisation

- All user-facing dates displayed in user's local timezone
- All stored dates in UTC
- Currency display according to user's locale settings
- UI supports right-to-left (RTL) layouts for Arabic/Hebrew markets (future)
- API error messages support localised strings via `Accept-Language` header

---

## 11. Integration Requirements

### 11.1 Email Notifications (AWS SES)

| Trigger | Recipient | Template |
|---|---|---|
| New user registered | Admin | `admin-new-registration` |
| Registration approved | User | `user-approved` |
| New PO created | Manufacturer | `po-created` |
| PO accepted/rejected | Brand | `po-response` |
| Report submitted | Brand | `report-submitted` |
| Audit assigned | Auditor + Manufacturer | `audit-assigned` |
| DHU alert > 5% | Brand | `quality-alert` |
| Delivery delayed | Brand | `delivery-alert` |
| Certification expiry 60 days | Brand + Manufacturer | `cert-expiry-warning` |
| Trial ending in 3 days | User | `trial-ending` |

### 11.2 Payment Processing (Stripe)

- Subscription billing via Stripe Billing
- Stripe Checkout for initial subscription setup
- Stripe Customer Portal for self-service billing management
- Webhook events: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
- Failed payment: 3 retry attempts over 7 days, then grace period of 7 days, then downgrade

### 11.3 Maps (Mapbox or Leaflet + OpenStreetMap)

- Live shipment tracking on interactive map
- Source, current position, and destination markers
- Route polyline drawn between origin and destination
- Geocoding: convert address to coordinates for destination setup
- Haversine formula for distance calculation between coordinates

### 11.4 QR Code Generation

- Every PO and every garment batch gets a unique QR code
- QR code encodes URL: `https://trace.textiletrace.com/story/{unique_id}`
- Generated as high-resolution PNG (300 DPI) for print, stored in S3
- QR code embedded in PDF packing slips and batch labels

### 11.5 PDF Generation (Celery + WeasyPrint)

- Audit reports, compliance certificates, traceability reports generated as PDF
- Generated in background via Celery worker
- Stored in S3, download URL sent to user via WebSocket notification + email
- PDF templates use brand's logo (fetched from S3) and the platform's design system

### 11.6 Mobile Push Notifications (Expo Push Service)

- New PO assigned (Manufacturer)
- Production report overdue (Manufacturer)
- Audit deadline approaching (Auditor + Manufacturer)
- Shipment received (Brand)

---

## 12. Infrastructure Requirements

### 12.1 Environment Strategy

| Environment | Purpose | Infrastructure |
|---|---|---|
| Local | Development | Docker Compose: all services |
| Staging | Integration testing, QA | Railway (backend), Vercel Preview (frontend) |
| Production | Live platform | AWS ECS + Vercel |

### 12.2 Docker Compose (Local Development)

```yaml
services:
  api:           # NestJS core API
  analytics:     # Python FastAPI data service
  worker:        # Celery background jobs
  postgres:      # PostgreSQL
  redis:         # Redis
  kafka:         # Apache Kafka
  clickhouse:    # ClickHouse analytics
  neo4j:         # Neo4j graph DB
  elasticsearch: # Elasticsearch
  frontend:      # Next.js dev server
```

### 12.3 AWS Production Infrastructure

```
VPC (textiletrace-prod)
├── Public Subnets (2 AZs)
│   ├── ALB (Application Load Balancer)
│   └── NAT Gateways
├── Private Subnets (2 AZs)
│   ├── ECS Fargate (Core API service)
│   ├── ECS Fargate (Analytics service)
│   ├── ECS Fargate (Go Event service)
│   ├── ECS Fargate (Celery workers)
│   └── RDS PostgreSQL (Multi-AZ)
└── Isolated Subnets
    └── ElastiCache Redis
    └── MSK Kafka

CDN Layer:
└── CloudFront → S3 (static assets, documents)
└── CloudFront → ALB (API, with edge caching)

External Services (same region):
├── ClickHouse Cloud
├── Neo4j AuraDB
└── Elasticsearch Service (AWS OpenSearch)
```

### 12.4 CI/CD Pipeline (GitHub Actions)

```yaml
On Pull Request:
  1. Run unit tests
  2. Run integration tests
  3. Type checking (tsc --noEmit)
  4. Lint (ESLint + Ruff)
  5. Security scan (Snyk)
  6. Deploy to staging (Vercel Preview + Railway)
  7. Run E2E tests against staging

On Merge to Main:
  1. All above checks pass
  2. Build Docker images
  3. Push to ECR
  4. Deploy to production (ECS rolling update)
  5. Run smoke tests against production
  6. Notify team on Slack
```

### 12.5 Monitoring & Alerting

| What to Monitor | Tool | Alert Threshold |
|---|---|---|
| API error rate | Grafana | > 1% of requests return 5xx |
| API P95 latency | Grafana | > 2s for any endpoint |
| Kafka consumer lag | Grafana | > 10,000 messages behind |
| Database CPU | Grafana | > 80% for 5 minutes |
| Database connection count | Grafana | > 90% of pool |
| Redis memory | Grafana | > 80% used |
| Celery queue depth | Grafana | > 500 pending jobs |
| ECS service health | AWS CloudWatch | < 2 healthy tasks |
| Failed login spikes | Custom alert | > 100 failures/minute |

---

## 13. Migration Plan

### 13.1 Phase 1: Foundation (Weeks 1–6)

**Goal:** Fix data integrity and performance without rewriting any features

1. **PostgreSQL Migration**
   - Set up Supabase PostgreSQL instance
   - Write migration scripts: MongoDB collections → PostgreSQL tables
   - Run migrations with dual-write (write to both MongoDB and PostgreSQL) for 2 weeks
   - Validate data parity, then cut over to PostgreSQL as primary
   - Decommission MongoDB

2. **Redis Setup**
   - Deploy Upstash Redis
   - Add cache layer to all dashboard endpoints
   - Add cache invalidation on data mutations
   - Verify dashboard load time improvement

3. **Clerk Authentication**
   - Set up Clerk application with same roles
   - Migrate existing users to Clerk (create accounts, preserve roles)
   - Deploy new auth endpoints backed by Clerk
   - Gradual rollout: 10% → 50% → 100% of new logins via Clerk
   - Decommission custom JWT implementation

### 13.2 Phase 2: Frontend (Weeks 7–10)

1. **CRA → Next.js Migration**
   - Create new Next.js app with App Router
   - Copy all page components (they are plain React components — no changes needed)
   - Migrate routing from React Router to Next.js file-based routing
   - Convert `/consumer/story` route to Server Component (SSR)
   - All other routes remain Client Components (same as today)
   - Update Vercel deployment config

2. **TanStack Query**
   - Replace all `useEffect + axios` patterns with `useQuery` / `useMutation`
   - Configure 2-minute stale time for dashboard data
   - Add background refetch on window focus

### 13.3 Phase 3: API Layer (Weeks 11–18)

1. **NestJS Setup**
   - Create NestJS application with module structure matching existing FastAPI routes
   - Implement all endpoints against PostgreSQL using Prisma
   - Run NestJS in parallel with FastAPI (same data source)
   - Migrate frontend endpoints one module at a time (auth → users → POs → ...)
   - Keep FastAPI running only for analytics endpoints (Python remains for data work)
   - Decommission FastAPI API routes once all migrated

2. **GraphQL Layer**
   - Add Apollo Server to NestJS
   - Define GraphQL schema for complex nested queries
   - Migrate Command Center and Traceability pages to GraphQL queries
   - Keep REST for simple CRUD (no need to convert everything)

### 13.4 Phase 4: Specialized Databases (Weeks 19–28)

1. **ClickHouse** — Analytics
   - Deploy ClickHouse Cloud instance
   - Build Kafka → ClickHouse sink connector
   - Backfill historical data from PostgreSQL (one-time migration script)
   - Migrate Command Center API to query ClickHouse instead of PostgreSQL
   - Benchmark: validate < 1s dashboard query time

2. **Neo4j** — Traceability
   - Deploy Neo4j AuraDB instance
   - Build Kafka → Neo4j consumer (write graph events on PO creation, traceability updates)
   - Backfill existing traceability data to Neo4j
   - Migrate TraceabilityTree / TraceabilityFlow pages to use Neo4j Cypher queries
   - Benchmark: validate < 200ms graph traversal

3. **Kafka** — Event Spine
   - Deploy Upstash Kafka
   - Implement event publishing in NestJS for all data mutations
   - Build consumers: PostgreSQL (audit log), ClickHouse (analytics), Neo4j (graph)
   - Validate event replay capability with historical backfill

---

## 14. Compliance Requirements

### 14.1 GDPR (EU General Data Protection Regulation)

- Lawful basis documented for all personal data processing
- Privacy policy accessible from every page
- Cookie consent banner on first visit
- Right to erasure: user deletion anonymises PII within 30 days
- Right to portability: user can export all their data as JSON
- Data breach notification: notify affected users within 72 hours
- Data Processing Agreement (DPA) available for enterprise customers

### 14.2 EU Corporate Sustainability Due Diligence Directive (CSDDD)

- Supply chain documentation sufficient to demonstrate due diligence
- Immutable audit trail of all supplier assessments
- Document retention: minimum 5 years for all compliance records
- Risk assessment records for each supplier tier

### 14.3 German Supply Chain Due Diligence Act (LkSG)

- Tier 1 and Tier 2 supplier risk assessments documented
- Corrective action tracking for identified risks
- Annual reporting data exportable from platform

### 14.4 Data Residency

- EU customer data stored in AWS eu-west-1 (Ireland) only
- US customer data stored in AWS us-east-1 only
- No cross-region data transfer for personal data
- Data residency region configurable per organisation at signup

---

## 15. Testing Requirements

### 15.1 Unit Tests

- Minimum 80% line coverage on all backend services
- All pure functions (score calculators, validators, formatters) must have 100% coverage
- Mocked database — unit tests do not touch any real database

### 15.2 Integration Tests

- All API endpoints must have at least one integration test hitting a real test database
- Integration tests run against: PostgreSQL, Redis, Neo4j (test instances via Docker)
- Cross-tenant access tests: every endpoint tested with a token from a different organisation (must return 403)
- Auth tests: expired token, invalid token, missing token (must return 401)

### 15.3 End-to-End Tests (Playwright)

| Critical Path | Test |
|---|---|
| Brand creates PO → Manufacturer accepts → Production report submitted → Brand approves | Full PO lifecycle |
| Traceability data entered → QR code generated → Consumer scans → Story page loads | Consumer traceability |
| File uploaded → Virus scan → Stored in S3 → Download via signed URL | Document management |
| User registers → Admin approves → User logs in → Accesses dashboard | User onboarding |
| Brand creates season → Uploads mood board → Creates collection → Manufacturer uploads swatches → Brand selects | Design workflow |

### 15.4 Performance Tests (k6)

- Load test: 500 concurrent users on dashboard for 10 minutes — no degradation
- Stress test: ramp to 2,000 concurrent users — graceful degradation, no crashes
- Spike test: 5,000 QR scan events/second for 60 seconds — Go service must handle without data loss
- Soak test: 200 concurrent users for 8 hours — no memory leaks

### 15.5 Security Tests

- OWASP Top 10 scan on every release (automated via OWASP ZAP in CI)
- SQL injection attempt on every input field — must return 400, never execute
- Cross-tenant access attempt on every authenticated endpoint
- File upload: attempt upload of .exe, .php, oversized file — must reject
- Rate limiting: exceed limits and verify 429 response
- Penetration test by external security firm: quarterly

---

*Document maintained by the TextileTrace engineering team.*  
*Next review: June 2026*
