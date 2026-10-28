# VoltReserve — REST API Documentation

Base URL: `http://localhost:8080/api`

All authenticated requests must include the header:
```text
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication APIs

### Register New User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "rahul.sharma@example.com",
  "password": "password123",
  "fullName": "Rahul Sharma",
  "phone": "+919822012345",
  "role": "ROLE_USER"
}
```
- **Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 2,
  "email": "rahul.sharma@example.com",
  "fullName": "Rahul Sharma",
  "role": "ROLE_USER"
}
```

### User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@voltreserve.com",
  "password": "admin123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "admin@voltreserve.com",
  "fullName": "VoltReserve System Admin",
  "role": "ROLE_ADMIN"
}
```

### Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated

---

## 2. Stations & Discovery APIs

### Search Charging Stations
- **Endpoint:** `GET /api/stations`
- **Access:** Public
- **Query Parameters:** `cityId`, `locationId`, `connectorTypeId`, `keyword`, `userLat`, `userLon`
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "VoltReserve Supercharge - Gangapur Rd",
    "description": "Flagship ultra-fast charging center on Gangapur Road.",
    "operatingHours": "24/7",
    "amenities": "EV Lounge, WiFi, Cafe, Restrooms",
    "rating": 4.85,
    "isActive": true,
    "location": {
      "id": 1,
      "cityName": "Nashik",
      "address": "Near Pramod Mahajan Garden, Gangapur Road",
      "latitude": 19.9982000,
      "longitude": 73.7654000
    },
    "distanceKm": 3.42,
    "estimatedTravelMinutes": 6,
    "availableChargersCount": 3,
    "totalChargersCount": 3,
    "minPricePerKwh": 15.00,
    "maxPowerKw": 120.00,
    "supportedConnectors": ["CCS2", "TYPE2"],
    "estimatedChargingMinutes": 13,
    "estimatedCost": 375.00
  }
]
```

### Compare Stations
- **Endpoint:** `GET /api/stations/compare?ids=1,4,7`
- **Access:** Public

---

## 3. Slot Management & Booking APIs

### View Slots for Charger
- **Endpoint:** `GET /api/chargers/{id}/slots?date=YYYY-MM-DD`
- **Access:** Public / Authenticated

### Hold Slot (Temporary 10-Minute Lock)
- **Endpoint:** `POST /api/bookings/hold`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "slotId": 5,
  "vehicleId": 1
}
```
- **Response (200 OK):**
```json
{
  "slotId": 5,
  "status": "HELD",
  "holdExpiresAt": "2026-10-23T11:45:00",
  "startTime": "2026-10-23T11:00:00",
  "endTime": "2026-10-23T11:30:00",
  "chargerCode": "NSK-GNP-CCS2-01"
}
```

### Confirm Reservation
- **Endpoint:** `POST /api/bookings`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "slotId": 5,
  "vehicleId": 1,
  "paymentMethod": "UPI"
}
```
- **Response (201 Created):**
```json
{
  "id": 14,
  "bookingReference": "VR-NAS-20261023-A8F2",
  "status": "CONFIRMED",
  "stationName": "VoltReserve Supercharge - Gangapur Rd",
  "chargerCode": "NSK-GNP-CCS2-01",
  "startTime": "2026-10-23T11:00:00",
  "endTime": "2026-10-23T11:30:00",
  "estimatedKwh": 25.00,
  "totalAmount": 512.50,
  "blockchainHash": "4420c6f438d00356141937542c4f55136b8571082dd96bdd74f1080a46069b21",
  "blockIndex": 3,
  "blockchainStatus": "VERIFIED"
}
```

### Cancel Booking
- **Endpoint:** `POST /api/bookings/{id}/cancel`
- **Access:** Authenticated (Owner or Admin)

---

## 4. Blockchain Cryptographic Audit APIs

### Verify Booking Integrity
- **Endpoint:** `POST /api/bookings/{id}/verify`
- **Access:** Public / Authenticated
- **Response (200 OK):**
```json
{
  "blockIndex": 1,
  "bookingId": 1,
  "bookingReference": "VR-NSK-20261023-0001",
  "recordedTransactionHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "calculatedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
  "status": "VERIFIED",
  "isTamperDetected": false,
  "verificationMessage": "Integrity confirmed: Current database state matches cryptographic block header."
}
```

### View Complete Block Ledger
- **Endpoint:** `GET /api/blockchain/chain`
- **Access:** Public

---

## 5. Map & Routing APIs

### Calculate Route
- **Endpoint:** `POST /api/routes`
- **Access:** Public
- **Request Body:**
```json
{
  "originLat": 19.9974530,
  "originLng": 73.7898030,
  "destinationLat": 19.9982000,
  "destinationLng": 73.7654000
}
```
- **Response (200 OK):**
```json
{
  "distanceKm": 3.12,
  "durationMinutes": 6,
  "coordinates": [
    [19.997453, 73.789803],
    [19.997541, 73.786520],
    [19.998200, 73.765400]
  ],
  "summary": "Fastest route via arterial corridor (3.1 km, ~6 mins)",
  "estimatedEnergyConsumptionKwh": 0.50
}
```

---

## 6. Admin Management APIs

Protected by `hasRole('ROLE_ADMIN')`:
- `GET /api/admin/dashboard` - Platform statistics & KPIs
- `GET /api/admin/users` - Driver accounts
- `PUT /api/admin/users/{id}/toggle-status` - Activate / Disable user
- `POST /api/admin/slots/generate` - Batch slot generation
- `POST /api/admin/stations` - Create station
- `PUT /api/admin/stations/{id}` - Update station
- `DELETE /api/admin/stations/{id}` - Delete station
- `POST /api/admin/blockchain/simulate-tamper/{bookingId}` - Simulate database alteration for demonstration.
