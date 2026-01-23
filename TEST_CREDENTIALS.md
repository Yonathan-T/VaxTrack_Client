# Appointments API Guide

## Overview

All appointments endpoints are under the protected v1 group (`auth:sanctum`), so they always require a Bearer token.

## 1. List Appointments

**Endpoint:** `GET /api/v1/appointments`

**Who can call it:** Any authenticated user (no role restriction)

**What it does:**
Returns appointments for the current user's facility (if facility_id is set), or all facilities if the user is a super admin (facility_id is null).
Defaults to today's appointments; can filter by date and status.

**Optional query params:**

- `date` (defaults to today, format YYYY-MM-DD)
- `status` (e.g., pending, completed, etc.)

**Response:**
success, date, count, data (list of appointments with child.parent and vaccinationRecords.vaccine relations loaded)

## 2. Show a Single Appointment

**Endpoint:** `GET /api/v1/appointments/{appointmentId}`

**Who can call it:** Any authenticated user

**What it does:**
Returns a single appointment with child.parent and vaccinationRecords.vaccine loaded.

## 3. Reschedule/Update an Appointment

**Endpoint:** `PUT /api/v1/appointments/{appointmentId}`

**Who can call it:** Any authenticated user

**What it does:**

- Updates scheduled_at and optional notes.
- Capacity check: if the facility has a daily_capacity, it ensures the new date isn't already full.
- Also updates scheduled_date for all linked vaccination_records to the new date.

**Payload:**

```json
{
  "scheduled_at": "2026-02-05T10:00:00",
  "notes": "Rescheduled due to conflict"
}
```

**Error response (capacity):**
422 with message and available_capacity: 0 if full.

## 4. Check Facility Capacity

**Endpoint:** `GET /api/v1/facilities/{facilityId}/capacity`

**Who can call it:** Any authenticated user

**What it does:**
Returns how many slots are left for a given facility on a given date.

**Optional query:**

- `date` (defaults to today)

**Response:**

```json
{
  "success": true,
  "facility": "Lideta Health Center",
  "date": "2026-01-23",
  "total_capacity": 50,
  "booked": 12,
  "remaining_slots": 38,
  "is_full": false
}
```

## Notes for Frontend

- **No role restrictions** on these endpoints (just auth), so any logged-in user can list/view/update appointments.
- **Facility scoping:** If the user has a facility_id, results are scoped to that facility automatically.
- **Capacity enforcement:** Only enforced on PUT (reschedule) and via the checkCapacity helper.
