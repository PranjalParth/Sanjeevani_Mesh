# Sanjeevani-Mesh (संजीवनी मेश)
### Cross-District Dynamic Medicine Rebalancing Engine

> **A decentralized healthcare logistics web platform that monitors medicine inventories across Primary Health Centres (PHCs) and Community Health Centres (CHCs), detects critical stock deficits (Anti-Rabies Vaccines, Anti-Snake Venom, Insulin, Oxytocin, ORS), matches them with nearby surplus/near-expiry stock using algorithmic FEFO optimization, and coordinates cold-chain transfer logistics.**

---

## 1. System Architecture & Google Cloud Integration

Sanjeevani-Mesh is structured to mirror enterprise-scale Google Cloud healthcare infrastructure:

```
                                  ┌──────────────────────────────────────────────┐
                                  │           Sanjeevani-Mesh Frontend           │
                                  │      (Next.js 14, Tailwind CSS, Leaflet)     │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                          ┌──────────────────────────────┼──────────────────────────────┐
                          ▼                              ▼                              ▼
             ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
             │   Autonomous Matching   │    │  In-Memory State Store  │    │   Vertex AI / Gemini    │
             │    Rebalancing Engine   │    │ (Firestore / BQ Schema) │    │     Demand Assistant    │
             │  - Haversine Distance   │    │  - 7 PHCs / CHCs        │    │  - Depletion Forecast   │
             │  - FEFO Expiry Urgency  │    │  - 35+ Drug Batches     │    │  - Manifest Synthesis   │
             │  - Cold-Chain Route Eval│    │  - Real-Time Dispatches │    │  - Cold-Chain Audit     │
             └─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

- **Google Cloud Run**: Serverless containerized microservices hosting the rebalancing logic.
- **Cloud Firestore**: Real-time document store modeling `/facilities/{facilityId}`, `/inventory/{batchId}`, and `/transfers/{transferId}`.
- **BigQuery GIS**: Geospatial spatial join queries (`ST_DISTANCE`, `ST_MAKELINE`) for transit route planning.
- **Vertex AI / Gemini 1.5 Flash**: Medical supply chain reasoning model providing natural-language depletion queries, risk assessments, and digital transfer manifest generation.

---

## 2. Core Features

### 1. Executive Dashboard & Real-Time KPIs
- **Active Health Nodes**: 7 synchronized PHCs, CHCs, and District Hospitals across the Bhopal, Sehore, and Raisen district cluster.
- **Stock-Out Risk (<72h)**: Instant red alert for facilities facing imminent stock exhaustion.
- **Near-Expiry Batches (<30 Days)**: First-Expired, First-Out (FEFO) donor opportunity tracker to avert medicine expiration waste.
- **Rebalanced Today Counter**: Real-time count of dispatched consignments and units preserved.
- **Cold-Chain Telemetry Pass Rate**: 99.4% standard compliance across active ILRs (Ice-Lined Refrigerators).

### 2. Autonomous Rebalancing Engine (The Core Hook)
- **Multi-Criteria Optimization Scoring**:
  $$\text{Score} = 0.50 \cdot \text{ExpiryUrgency (FEFO)} + 0.35 \cdot \text{DistanceProximity} + 0.15 \cdot \text{SurplusRatio}$$
- **Algorithmic Donor-Recipient Pairing**: Matches critical deficit nodes (e.g., PHC Bilkisganj with 0.8 days of ASV remaining) with optimal donors (e.g., CHC Mandideep with batch expiring in 22 days).
- **Logistics & Cold-Chain Safeguards**: Automatically recommends carrier modes (Active Refrigerated Electric Vehicle, Conditioned PCM Ice-Lined Box, or Medical Drone Air Delivery).
- **One-Click Dispatch Workflow**: Real-time inventory deduction from donor, transfer credit to recipient, and automated manifest creation.

### 3. Interactive Geospatial District Mesh Map
- Dynamic Leaflet map with custom pulsing SVG pins (Red = Critical Deficit, Amber = Near-Expiry Surplus, Green = Optimal).
- Transfer corridor polylines displaying road distances, transit ETAs, and carrier modes.
- Interactive popups with Medical Officer contacts and cold-chain temperature telemetry.

### 4. Primary Health Centre Inventory Management
- High-density tabular registry of medicine batches across all 7 facilities.
- Real-time search and filter chips: *All Drugs*, *Critical Deficit (<3d)*, *Expiring Soon (<30d)*, *Cold-Chain Only (2°C-8°C)*.
- Visual days-of-cover capacity bars and batch traceability.

### 5. Gemini AI Drug Demand Assistant
- Interactive side-drawer grounded in live district inventory data.
- Capable of answering complex clinical logistics queries:
  - *"Which PHCs in Sector 4 will run out of Anti-Venom within 72 hours?"*
  - *"Generate an optimal transfer manifest for PHC-Bilkisganj from CHC-Mandideep."*
  - *"Explain why CHC-Mandideep was selected as donor instead of District Hospital Sehore."*
  - *"Perform a cold-chain risk audit for 2°C-8°C vaccine transit."*
- Full Vertex AI chain-of-thought accordion display.

### 6. Official Government Digital Transfer Manifest
- Stylized National Health Mission / Directorate of Health Services official consignment paperwork.
- Consignment details, donor MO signature verification, receiving acknowledgement, GPS route parameters, and SHA-256 cryptographic audit hash.
- Printable / downloadable document view.

---

## 3. Directory Structure

```
sanjeevani-mesh/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── facilities/route.ts       # Facility & inventory state API
│   │   │   ├── rebalance/route.ts        # Algorithmic matcher & dispatch execution
│   │   │   └── gemini/route.ts           # Gemini 1.5 Flash / Vertex AI assistant
│   │   ├── globals.css                   # Tailwind + Leaflet dark theme styling
│   │   ├── layout.tsx                    # HTML shell & font definitions
│   │   └── page.tsx                      # Main unified dashboard view
│   ├── components/
│   │   ├── AI/
│   │   │   └── GeminiAssistant.tsx       # Drawer chat with reasoning steps
│   │   ├── Dashboard/
│   │   │   ├── AnalyticsCharts.tsx       # Recharts depletion forecast & distribution
│   │   │   └── KpiGrid.tsx               # Executive KPI stat cards
│   │   ├── Inventory/
│   │   │   └── InventoryTable.tsx        # High-density drug inventory table
│   │   ├── Manifest/
│   │   │   └── ManifestModal.tsx         # Official Government Digital Manifest
│   │   ├── Map/
│   │   │   ├── DistrictMap.tsx           # Leaflet interactive geospatial map
│   │   │   └── MapWrapper.tsx            # Dynamic SSR-safe wrapper
│   │   ├── Navigation/
│   │   │   └── Navbar.tsx                # Header with cluster heartbeat
│   │   └── Rebalancer/
│   │       └── RebalanceWorkbench.tsx    # FEFO matching workbench & dispatch
│   ├── data/
│   │   └── mockData.ts                   # Realistic 7-node central MP dataset
│   ├── services/
│   │   ├── rebalancer.ts                 # Haversine distance, FEFO scoring & manifests
│   │   └── store.ts                      # In-memory store mirroring Firestore
│   └── types/
│       └── index.ts                      # Complete TypeScript domain models
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or yarn

### Installation
```bash
cd "C:\Users\PRANJAL\.gemini\antigravity\scratch\sanjeevani-mesh"
npm install
```

### Environment Configuration (Optional)
To use live Google Gemini API calls, create a `.env.local` file:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: If no API key is provided, the system seamlessly uses the built-in clinical reasoning engine with zero setup).*

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Recommended Workspace Setting
For optimal editing and terminal workflow, please set:
`C:\Users\PRANJAL\.gemini\antigravity\scratch\sanjeevani-mesh` as your active workspace in Antigravity.
