# VOLTRESERVE — Full-Stack Smart EV Charging Reservation Platform

> **Find → Compare → Reserve → Navigate → Charge → Pay**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java-17%20LTS-red.svg)](https://www.oracle.com/java/)
[![Blockchain](https://img.shields.io/badge/Blockchain-SHA--256-emerald.svg)]()
[![Leaflet](https://img.shields.io/badge/Map-Leaflet%20%2B%20OSM-green.svg)](https://leafletjs.com/)
[![Build Status](https://img.shields.io/badge/Tests-10%2F10%20Passing-success.svg)]()

---

## 1. Project Overview

**VoltReserve** is an enterprise-grade full-stack smart electric vehicle (EV) charging reservation and management platform. It addresses the growing range anxiety, station overcrowding, and scheduling uncertainty experienced by EV drivers by offering guaranteed slot reservations, double-booking prevention, multi-criteria station recommendations, interactive road navigation, and cryptographic transaction auditing.

### Tagline
**Find → Compare → Reserve → Navigate → Charge → Pay**

### Primary Objective
> To develop a smart reservation and management platform that eliminates uncertainty, eliminates queue contention, and minimizes waiting time for EV charging through atomic scheduling guarantees.

---

## 2. Problem Statement

As electric vehicle adoption surges, public charging infrastructure faces critical operational hurdles:
1. **Queue Bottlenecks & Uncertainty:** Drivers arrive at stations with low battery status only to find all chargers occupied or out of service.
2. **Double-Booking Vulnerabilities:** Primitive booking mockups rely solely on client-side status checks, causing race conditions where two simultaneous drivers confirm the same charger.
3. **Incompatible Hardware:** Drivers arrive at chargers with mismatched connector protocols (e.g., CCS2 vs. Type 2 AC vs. CHAdeMO).
4. **Audit & Data Integrity Risks:** Traditional booking databases are vulnerable to internal record tampering and post-facto billing disputes.

---

## 3. Specific Project Objectives

1. **Advance Charging-Slot Reservation:** Book charging slots hours or days in advance.
2. **Real-Time / Synchronized Availability:** Track slot statuses (`AVAILABLE`, `HELD`, `BOOKED`, `OCCUPIED`, `COMPLETED`, `CANCELLED`, `EXPIRED`).
3. **Hardware Compatibility Matching:** Prevent booking chargers incompatible with the user's EV connector.
4. **Mathematical Double-Booking Prevention:** Eliminate race conditions using pessimistic write locks (`SELECT ... FOR UPDATE`) and database-level unique constraints.
5. **Temporary Slot Hold:** Auto-expiring 10-minute hold window allowing payment finalization without permanently blocking slots.
6. **Charging Time & Tariff Estimation:** Precise projection of charging duration (20% to 80% SOC) and tariff costs based on battery capacity and dispenser power.
7. **Smart Multi-Criteria Recommendations:** Station ranking combining distance (40%), current availability (25%), power output (20%), and user reviews (15%).
8. **Interactive Road Navigation:** Route calculation with distance, travel time, and polyline visualization using Leaflet + OpenStreetMap.
9. **Cryptographic SHA-256 Ledger Audit:** Each confirmed reservation forms a block cryptographically sealed with the hash of the previous block, instantly flagging offline database tampering.
10. **Centralized Operator Administration:** Dedicated administrative hub for station provisioning, dispenser configuration, slot batch generation, user monitoring, and cryptographic verification.

---

## 4. Key Features

- **Live Hub Discovery:** Search charging stations across metropolitan regions (Nashik, Pune, Mumbai) with granular filtering by connector standard, minimum power (50kW, 100kW, 150kW), and distance.
- **Side-by-Side Comparison:** Compare up to 3 stations simultaneously on power, tariffs, available guns, and amenities.
- **Visual Slot Matrix:** Color-independent status badges with text, icons, disabled states, and active hold countdown timers.
- **Distance Fairness Policy:** First confirmed reservation wins. Proximity is used for ETA and recommendations, never silently overriding confirmed slots.
- **Hardware Telemetry Simulation:** One-click simulation of EV plug-in (`OCCUPIED`) and charging completion (`COMPLETED`) for real-time demonstrations.
- **Tamper Simulation Engine:** Built-in admin tool to simulate database tampering and witness real-time cryptographic `TAMPER_DETECTED` verdicts.

---

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Engine** | Java 17 LTS, Spring Boot 3.2.5, Spring Data JPA, Spring Security |
| **Database** | MySQL 8.0 (InnoDB Engine, ACID Transactions, Row-Level Locking) |
| **Frontend Framework** | React 18, Vite 5, React Router 6, Axios |
| **User Interface** | Tailwind CSS 3.4, Lucide Icons, Plus Jakarta Sans typography |
| **Mapping & Routing** | Leaflet 1.9, React-Leaflet 4, OpenStreetMap, Routing Service Abstraction |
| **Security & Auth** | JWT (`io.jsonwebtoken`), BCrypt Password Encoder (10 rounds) |
| **Cryptography** | SHA-256 Hash Chaining (`previousHash` pointer verification) |
| **Testing** | JUnit 5, Spring Boot Test, MockMvc, H2 In-Memory Suite |

---

## 6. System Architecture

```text
                    ┌───────────────────────────────────┐
                    │    React 18 + Vite Web App        │
                    │   (Tailwind CSS + Leaflet OSM)    │
                    └─────────────────┬─────────────────┘
                                      │
                              REST API (JSON / JWT)
                                      │
                    ┌─────────────────▼─────────────────┐
                    │     Spring Boot 3 REST Backend    │
                    │   (Java 17, Spring Security)      │
                    └────────┬──────────────────┬───────┘
                             │                  │
            ┌────────────────▼─┐             ┌──▼─────────────────┐
            │  MySQL 8.0 RDBMS │             │ Cryptographic      │
            │ (InnoDB Engine)  │             │ SHA-256 Blockchain │
            └──────────────────┘             │ Audit Ledger       │
                                             └────────────────────┘
```

Detailed architectural specifications and sequence flows are documented in [`docs/architecture.md`](file:///c:/Users/SMC/Desktop/pbl-EV/docs/architecture.md).

---

## 7. Database Design & Integrity Rules

```text
City
 └── Location
      └── ChargingStation
           └── Charger
                └── ChargingSlot
                     └── Booking ──► Payment & ChargingSession ──► BlockchainRecord
```

- **Discretization & Unique Constraint:**
  ```sql
  UNIQUE KEY uq_charger_slot_time (charger_id, start_time)
  ```
- **Dispenser Unique Code:**
  ```sql
  UNIQUE KEY uq_station_charger_code (station_id, identifier_code)
  ```
- **Blockchain Block Height:**
  ```sql
  UNIQUE KEY uq_blockchain_block_index (block_index)
  UNIQUE KEY uq_blockchain_booking (booking_id)
  ```

Complete table schema and entity-relationship diagrams are documented in [`docs/database-design.md`](file:///c:/Users/SMC/Desktop/pbl-EV/docs/database-design.md).

---

## 8. Concurrency & Double-Booking Prevention

### The Golden Rule:
> **One charger + one time slot + overlapping booking = only one successful confirmed booking.**

1. **Transactional Row Lock (`Pessimistic Write`):**
   ```java
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @Query("SELECT s FROM ChargingSlot s WHERE s.id = :id")
   Optional<ChargingSlot> findByIdWithLock(@Param("id") Long id);
   ```
2. **Atomic Overlap Check:**
   Queries active bookings and slots for `(start_time < new_end_time AND end_time > new_start_time)`.
3. **Racing Attempt Resolution:**
   - Transaction 1: Acquires row lock → Verifies availability → Updates status to `BOOKED` → Commits.
   - Transaction 2: Waits for lock release → Reads updated state (`BOOKED`) → Aborts → Throws `SlotNotAvailableException` (HTTP `409 CONFLICT`).
   - Frontend UI: Alerts driver *"This slot was just booked by another user. Please select another available slot."* and refreshes availability.

---

## 9. Cryptographic Blockchain Verification Layer

### Canonical Hash Composition:
```text
CanonicalData = "bookingId:" + id +
                "|reference:" + reference +
                "|userId:" + userId +
                "|stationId:" + stationId +
                "|chargerId:" + chargerId +
                "|slotId:" + slotId +
                "|startTime:" + startTime +
                "|endTime:" + endTime +
                "|amount:" + totalAmount +
                "|status:" + status;
```

### Hash Pointer Chaining:
```text
Block 1 (Genesis)              Block 2                        Block 3
Hash: 4420c6f4...              Hash: d4568f0f...              Hash: 731ce595...
Prev: 00000000... ──────────►  Prev: 4420c6f4... ──────────►  Prev: d4568f0f...
```

### Verification & Tamper Detection:
- On invoking `POST /api/bookings/{id}/verify`, the system retrieves the live database record, reconstructs the canonical string, and calculates the SHA-256 hash.
- If `calculatedHash == recordedHash`: Returns `VERIFIED`.
- If any operational field was altered: Returns `TAMPER_DETECTED`.

---

## 10. Automated Test Suite (10 Specific Tests)

The test suite is located in `backend/src/test/java/com/voltreserve/backend/VoltReserveSystemTests.java` and executes all 10 mandated requirements:

| # | Test Case Description | Verified Behavior |
|---|---|---|
| **Test 1** | Available slot booking | Transition from `AVAILABLE` to `BOOKED`, creates confirmed booking. |
| **Test 2** | Already-booked slot rejection | Subsequent attempt throws `SlotNotAvailableException` (HTTP 409). |
| **Test 3** | Concurrent simultaneous booking | 2 threads fire simultaneously on same slot: exactly 1 succeeds, 1 rejected. |
| **Test 4** | Expired hold release | Held slot with expired timer automatically resets to `AVAILABLE`. |
| **Test 5** | Incompatible charger protocol | Vehicle with CCS2 booking Type 2 AC is rejected with `IncompatibleChargerException`. |
| **Test 6** | Cancelled booking release | Cancelling restores slot status back to `AVAILABLE`. |
| **Test 7** | Cryptographic hash matching | Unaltered booking returns status `VERIFIED` with identical hash. |
| **Test 8** | Tamper detection on alteration | Altering booking amount in DB triggers `TAMPER_DETECTED`. |
| **Test 9** | Unauthorized admin access | Normal user receives HTTP 403 Forbidden on `/api/admin/dashboard`. |
| **Test 10** | Invalid booking request | Malformed or non-existent slot ID is cleanly rejected. |

---

## 11. Demo Accounts

| Role | Email | Password | Pre-configured Data |
|---|---|---|---|
| **System Administrator** | `admin@voltreserve.com` | `admin123` | Full CRUD privileges, slot provisioner, tamper simulator |
| **EV Driver 1** | `rahul.sharma@example.com` | `password123` | Tata Nexon EV Max (CCS2, 40.5 kWh, MH-15-EV-1024) |
| **EV Driver 2** | `priya.patil@example.com` | `password123` | Mahindra XUV400 (CCS2, 39.4 kWh, MH-01-EV-8899) |

---

## 12. Setup & Execution Guide

### Prerequisites
- Java 17+ LTS installed (`java -version`)
- Apache Maven 3.8+ installed (`mvn -version`)
- Node.js 18+ & npm installed (`node -v`)
- MySQL Server 8.0 running locally on port 3306

---

### Step 1: Database Setup
1. Open MySQL command line or Workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS voltreserve;
   ```
2. Execute the schema and seed scripts:
   ```bash
   mysql -u root voltreserve < database/schema.sql
   mysql -u root voltreserve < database/seed.sql
   ```

---

### Step 2: Backend Setup & Testing
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Run the automated test suite (verifying all 10 tests):
   ```bash
   mvn test
   ```
3. Start the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on **`http://localhost:8080`**.

---

### Step 3: Frontend Setup & Launch
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be live at **`http://localhost:5173`**.

---

### Step 4: Docker Compose Option (One-Click Launch)
If Docker and Docker Compose are installed:
```bash
docker-compose up --build
```
This spins up MySQL 8.0, Spring Boot, and React in orchestrated containers.

---

## 13. Production Deployment Guide

VoltReserve is architected for cloud hosting with containerized Spring Boot, static/CDN React delivery, and managed MySQL.

### 13.1 Architecture Overview

```text
Drivers / Browser Client
         │
         ▼ (HTTPS)
┌─────────────────────────────────┐
│     Frontend Hosting (CDN)      │  Vercel / Netlify / Render Static Site / Nginx
│  Vite React App (frontend/dist) │  (VITE_API_BASE_URL=https://api.yourdomain.com)
└────────────────┬────────────────┘
                 │
                 │ JSON / REST / JWT (HTTPS)
                 ▼
┌─────────────────────────────────┐
│       Backend Service           │  Render Web Service / Railway / AWS ECS / VPS
│   Spring Boot 3.2.5 (Java 17)   │  Port: ${PORT} (Dynamic hosting port binding)
│   Health Check: /api/health     │  CORS: ${CORS_ALLOWED_ORIGINS}
└────────────────┬────────────────┘
                 │
                 │ TCP / SSL (3306)
                 ▼
┌─────────────────────────────────┐
│     Managed MySQL 8.0 Database  │  Aiven / AWS RDS / PlanetScale / Railway MySQL
│    InnoDB Engine, Row Locking   │  HikariCP Connection Pool (Auto-reconnect)
└─────────────────────────────────┘
```

---

### 13.2 Production Environment Variables

#### Backend (`backend/.env` or Host Environment Variables)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | Auto on Render | Port assigned dynamically by cloud provider | `10000` (Render) or `8080` |
| `SPRING_DATASOURCE_URL` | **Yes** | JDBC connection string to production MySQL | `jdbc:mysql://<host>:3306/<db>?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | **Yes** | Production database user | `voltreserve_user` |
| `SPRING_DATASOURCE_PASSWORD` | **Yes** | Production database password | `StrongSecretPassword123!` |
| `JWT_SECRET` | **Yes** | 256-bit cryptographic signing secret for JWT tokens | `v0ltR3s3rv3_Sup3r_S3cur3_Pr0ducti0n_JWT_S3cr3t_K3y_2026_X9#m!` |
| `CORS_ALLOWED_ORIGINS` | **Yes** | Comma-separated list of allowed frontend origins | `https://voltreserve.onrender.com,https://yourdomain.com` |
| `DB_POOL_MAX_SIZE` | No | Maximum HikariCP database connections | `10` |
| `DB_POOL_MIN_IDLE` | No | Minimum idle database connections | `2` |

#### Frontend (`frontend/.env.production` or Host Build Environment Variables)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Absolute HTTPS URL of the live backend REST API | `https://voltreserve-api.onrender.com/api` |

---

### 13.3 Production Build Commands

#### 1. Frontend Production Build
```bash
cd frontend
npm ci
npm run build
```
- **Output directory**: `frontend/dist/`
- Contains minified, chunked JS, CSS, and optimized assets ready for CDN or static file serving.

#### 2. Backend Production Build & Packaging
```bash
cd backend
mvn clean package -DskipTests=false
```
- **Output artifact**: `backend/target/backend-1.0.0.jar`
- Standalone executable Spring Boot fat JAR with embedded Tomcat and production profiles.

---

### 13.4 Deployment Options

#### Option A: One-Click Render Blueprint (`render.yaml`)

VoltReserve includes a complete `render.yaml` blueprint:

1. Push your repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
3. Select your repository. Render reads `render.yaml` and provisions:
   - **Backend Web Service**: Docker runtime, port auto-binding, `/api/health` health checks.
   - **Frontend Static Site**: Built from `frontend/`, configured with rewrite rules for Single Page Application routing.
4. Set your production secrets in the Render backend environment settings:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`
   - `CORS_ALLOWED_ORIGINS` (Set to the frontend URL generated by Render)

#### Option B: Docker Container Deployment

VoltReserve includes multi-stage, production-hardened Dockerfiles:

##### Backend Multi-stage Dockerfile (`backend/Dockerfile`):
- Stage 1: Maven 3.9 + Eclipse Temurin 17 builds the JAR.
- Stage 2: Eclipse Temurin 17 JRE runs the JAR on `${PORT:-8080}` without root privileges.

##### Frontend Nginx Dockerfile (`frontend/Dockerfile`):
- Stage 1: Node 20 builds static assets with `VITE_API_BASE_URL`.
- Stage 2: Nginx alpine image serves assets with gzip compression, cache headers, and SPA route fallback (`try_files $uri $uri/ /index.html`).

To run via Docker Compose:
```bash
docker compose -f docker-compose.yml up --build -d
```

---

### 13.5 Database Migration & Initialization

On your production MySQL database (e.g. AWS RDS, Aiven, or Railway MySQL):

1. **Initialize Core Tables**:
   ```bash
   mysql -h <prod-host> -P 3306 -u <user> -p <dbname> < database/schema.sql
   ```
2. **Seed Initial Chargers and Reference Data**:
   ```bash
   mysql -h <prod-host> -P 3306 -u <user> -p <dbname> < database/seed.sql
   ```
3. **(Optional) Seed Highway & Metro Hubs**:
   ```bash
   mysql -h <prod-host> -P 3306 -u <user> -p <dbname> < database/seed_large_stations.sql
   ```

---

### 13.6 Production Health Check & Monitoring

The backend exposes an unauthenticated health check endpoint:

```http
GET /api/health
```

**Sample 200 OK Response:**
```json
{
  "status": "UP",
  "database": "UP",
  "timestamp": "2026-10-28T15:20:00Z",
  "version": "1.0.0",
  "service": "VoltReserve Backend API"
}
```
Cloud providers (Render, AWS ALB, GCP Cloud Run) use this endpoint to monitor container health and handle zero-downtime rolling deploys.

---

### 13.7 Production Troubleshooting

1. **CORS Errors (`Access-Control-Allow-Origin`)**:
   - Ensure the `CORS_ALLOWED_ORIGINS` variable on the backend matches the exact origin of the frontend (e.g., `https://voltreserve.onrender.com` without a trailing slash).
2. **Database SSL Handshake Failure**:
   - Cloud databases (like Aiven or AWS RDS) require SSL. Verify the connection string contains `useSSL=true` and `allowPublicKeyRetrieval=true`.
3. **404 Not Found on Page Refresh (Client-Side Routing)**:
   - For Nginx or custom web servers, verify `try_files $uri $uri/ /index.html` is configured.
   - For Render static sites, ensure the rewrite rule `/* -> /index.html` is enabled (automatically defined in `render.yaml`).
4. **JWT Authentication Issues**:
   - Set `JWT_SECRET` to a consistent string across server restarts so active user sessions remain valid.

---

## 14. REST API Quick Reference

Complete endpoint specifications with sample JSON payloads are available in [`docs/api-documentation.md`](file:///c:/Users/SMC/Desktop/pbl-EV/docs/api-documentation.md).

- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/stations` — Search and filter stations
- `GET /api/chargers/{id}/slots` — View real-time slots
- `POST /api/bookings/hold` — Place temporary 10-minute hold
- `POST /api/bookings` — Confirm slot reservation
- `POST /api/bookings/{id}/verify` — Recalculate and audit SHA-256 block
- `POST /api/routes` — Calculate road routing, distance & travel time
- `GET /api/admin/dashboard` — Platform utilization and KPIs

---

## 14. Future Scope

- **OCPP 2.0.1 Integration:** Direct hardware communication with physical EVSE charging hardware via WebSocket protocols.
- **Dynamic Demand Pricing:** Peak and off-peak tariff adjustments based on local electrical grid strain.
- **Automated V2G (Vehicle-to-Grid):** Bi-directional power dispatch incentives for EV fleet owners during brownouts.

---

## 15. License

Developed for Academic and Project Demonstration purposes under the MIT License.
