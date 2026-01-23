# Health Official Campaigns API Guide

## Route Group Configuration

This route group:

```php
Route::middleware('role:health_official')->prefix('official')->group(function () {
    Route::post('/campaigns', [HealthOfficialController::class, 'storeCampaign']);
    Route::get('/campaigns', [HealthOfficialController::class, 'indexCampaigns']);
});
```

## What This Means

### 1. Base URL

Because it's inside `/v1`, these endpoints are actually:

- `GET /api/v1/official/campaigns`
- `POST /api/v1/official/campaigns`

### 2. Authentication Requirement

They are inside the protected `v1` group (`auth:sanctum`), so frontend must send:

```
Authorization: Bearer <token>
Accept: application/json (recommended)
```

If you don't, you'll get redirect/unauthorized behavior.

### 3. Role Requirement

They also require:

```
role:health_official
```

So only users whose role is exactly `health_official` can access them (admins/nurses/parents cannot).

## Endpoint Details

### GET /api/v1/official/campaigns

**What it does**
Returns a paginated list of campaigns with these fields:

- `id`
- `title`
- `target_region`
- `start_date`
- `end_date`
- `status`

**Response shape**
It returns:

- `success`
- `message`
- `data` (Laravel paginator object: items + pagination meta)

So in frontend, treat `data.data` as the list (depending on your paginator JSON format).

### POST /api/v1/official/campaigns

**What it does**
Creates a new campaign row in the campaigns table.

**JSON body your frontend must send**

Required fields:

- `title` (string)
- `target_region` (string)
- `start_date` (date)
- `end_date` (date, must be >= start_date)

Optional:

- `description` (string)
- `target_vaccine_code` (string, must exist in vaccines.code)

**Example:**

```json
{
  "title": "Measles Campaign - Bole",
  "description": "Catch-up vaccination for missed children",
  "target_region": "Bole",
  "start_date": "2026-02-01",
  "end_date": "2026-02-28",
  "target_vaccine_code": "MCV-1"
}
```

**Success response**
HTTP 201
JSON includes:

- `success: true`
- `message`
- `campaign_id`

**Validation failures**
HTTP 422 with validation errors (Laravel default).

## Campaign Model Details

**Fillable fields:**

- `title`
- `description`
- `target_region`
- `start_date`
- `end_date`
- `target_vaccine_code`
- `status`

Dates are cast to dates, so you should send ISO format `YYYY-MM-DD`.

---

**Status:** Explained what the `/v1/official/campaigns` endpoints do, what headers they need, required payload, and responses.
