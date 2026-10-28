# VoltReserve — System Architecture Documentation

## 1. Executive Architecture Overview

VoltReserve is engineered around a multi-tier, decoupled, and fault-tolerant architecture designed to eliminate charging uncertainty, queue contention, and double-booking hazards in electric vehicle charging networks.

```text
                     ┌───────────────────────────────┐
                     │    React 18 + Vite Frontend   │
                     │  (Tailwind CSS + Leaflet OSM) │
                     └───────────────┬───────────────┘
                                     │
                             REST API (JSON / JWT)
                                     │
                     ┌───────────────▼───────────────┐
                     │      Spring Boot 3 Backend    │
                     │  (Java 17, Spring Security)   │
                     └───────┬───────────────┬───────┘
                             │               │
            ┌────────────────▼─┐           ┌─▼──────────────────┐
            │  MySQL 8.0 RDBMS │           │ Cryptographic      │
            │ (InnoDB Engine)  │           │ SHA-256 Blockchain │
            └──────────────────┘           │ Audit Ledger       │
                                           └────────────────────┘
```

---

## 2. Core Architectural Layers

### A. Presentation Layer (Frontend)
- **Framework:** React 18 with Vite bundling.
- **Styling:** Custom Tailwind CSS configuration adhering to an EV-native color palette (Deep Green `#062822`, Electric Teal `#10b981`, Off-White neutral backgrounds).
- **Navigation & Maps:** Leaflet interactive mapping with OpenStreetMap tiles. Map controls render charger pins, custom user geolocation markers, and highway corridor polylines.
- **State Management:** Reactive Context API for global authentication state, token persistence, and active hold countdown timers.

### B. Business & Application Layer (Spring Boot Backend)
- **Layered Flow:** `Controller → Service → Repository → Relational Database`.
- **Security:** Stateless JWT authentication (`io.jsonwebtoken`), BCrypt password hashing (10 rounds), and role-based access control (`ROLE_USER`, `ROLE_ADMIN`).
- **Scheduling:** Background cron worker (`@Scheduled(fixedRate = 30000)`) automatically checks for expired temporary holds and restores slots to `AVAILABLE` status.
- **Routing Engine Abstraction:** Dedicated `RoutingService` calculating highway distance multipliers, travel durations, and realistic waypoint polylines.

### C. Data & Concurrency Layer (MySQL RDBMS)
- **Database Engine:** MySQL 8.0 InnoDB engine with full ACID transactional compliance.
- **Relational Integrity:** Foreign key constraints, composite unique indexes (`uq_charger_slot_time`, `uq_station_charger_code`).
- **Concurrency Isolation:** `Isolation.READ_COMMITTED` combined with pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) prevents race conditions.

### D. Cryptographic Ledger Layer (SHA-256 Blockchain)
- **Chain Topology:** Each confirmed booking produces a block pointing to `previousHash` from the prior block (or genesis zero-hash).
- **Canonical Payload:** Canonical representation containing `bookingId`, `bookingReference`, `userId`, `stationId`, `chargerId`, `slotId`, `startTime`, `endTime`, `totalAmount`, and `status`.
- **Tamper Detection:** Recalculates the SHA-256 hash on demand. Any offline SQL modification triggers `TAMPER_DETECTED`.

---

## 3. Concurrency & Double-Booking Prevention Protocol

The single most critical requirement of VoltReserve is:
> **One charger + one time slot + overlapping booking = only one successful confirmed booking.**

### Double-Booking Prevention Mechanism:
1. **Slot Discretization & Unique Constraint:**
   Every physical dispenser has pre-generated intervals (e.g. 30 minutes) backed by:
   ```sql
   UNIQUE KEY uq_charger_slot_time (charger_id, start_time)
   ```
2. **Pessimistic Row-Level Lock:**
   When booking or holding a slot, the backend executes:
   ```java
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @Query("SELECT s FROM ChargingSlot s WHERE s.id = :id")
   Optional<ChargingSlot> findByIdWithLock(@Param("id") Long id);
   ```
   This issues a `SELECT ... FOR UPDATE` in MySQL, locking the slot row until transaction commit.
3. **Double Verification Check:**
   Even within the locked transaction, the service queries:
   ```sql
   SELECT b FROM Booking b WHERE b.charger.id = :chargerId
   AND b.status IN ('HELD', 'CONFIRMED', 'OCCUPIED')
   AND (b.startTime < :endTime AND b.endTime > :startTime)
   ```
4. **Result:** If User A and User B concurrently request the exact same slot, User A acquires the lock and transitions the slot to `BOOKED`. User B then reads the updated state, aborts, and receives HTTP `409 CONFLICT` with the message:
   > *"This slot was just booked by another user. Please select another available slot."*

---

## 4. Distance Priority Rule Specification

**Scenario:**
- User A is 10 km away.
- User B is 500 meters away.
- Both desire the same charging slot.

**VoltReserve Golden Rule:**
> **First successfully confirmed reservation wins.**

Distance is exclusively utilized for:
- Station search and sorting
- Travel time estimation
- Smart multi-criteria recommendation ranking
- Route polyline display

Under no circumstance does physical proximity allow User B to silently cancel or displace User A's confirmed booking.
