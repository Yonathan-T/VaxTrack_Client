# Local Admin User Management Guide

## What Local Admin Can Do (Users They Can Create)

### Create Users (Local Admin)

Local admins can create ONLY nurses/healthcare workers and they are always tied to the local admin's facility.

There are two ways in your API:

### Option A: Create Nurse via "nurses" Endpoint

**Endpoint:** `POST /api/v1/nurses`

**Who can call it:** admin (including local admin)

**What it creates:** a healthcare_worker user for the admin's facility

**Payload depends on NurseController@store** (frontend should follow its required fields), but typically:

```json
{
  "name": "Nurse Name",
  "email": "nurse.new@vaxtrack.com",
  "password": "nurse12345",
  "phone": "+2519..."
}
```

### Option B: Create Nurse via Admin Users Endpoint

**Endpoint:** `POST /api/v1/admin/users`

Even though the endpoint supports multiple roles, the backend restricts local admins:

**Allowed role for Local Admin:** healthcare_worker only
**facility_id:** ignored/forced to local admin's facility

**Example payload:**

```json
{
  "name": "Nurse Name",
  "email": "nurse.new@vaxtrack.com",
  "password": "nurse12345",
  "role": "healthcare_worker",
  "facility_id": 999,
  "phone": "+2519..."
}
```

**Important:** Even if frontend sends facility_id, the backend will override it to the local admin's own facility_id.

## What Local Admin Cannot Do (Important for Frontend UI)

Local admins cannot create:

- `admin`
- `health_official`
- `parent`

Local admins also cannot assign users to other facilities.

## Frontend UI Recommendations for Local Admins

- Show only "Create Nurse" / "Create Healthcare Worker"
- Hide role selector (or lock it to healthcare_worker)
- Hide facility selector (or lock it to their facility)

## Helpful Endpoint for Local Admin UI (Listing Users)

**Endpoint:** `GET /api/v1/admin/users`

**Optional query:** `?role=healthcare_worker`

This will show staff in their facility + related parents logic (based on current controller behavior).
