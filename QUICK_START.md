###Recieve a stock
v1/inventory/receive

```
{
  "vaccine_id": 2,// from GET /v1/vaccines when we chose
  "batch_number": "BN-ABC-001",
  "quantity": 100,
  "expiry_date": "2026-12-31",
  "min_stock": 20,
  "manufacturer": "Acme Pharma",
  "supplier": "MoH Central Store",
  "storage_location": "Cold Room A",
  "notes": "Initial delivery",
  "facility_id": 3        // required only if super admin token
}
```
 response
 ```
 {
    "success": true,
    "message": "Received 100 doses of OPV 0 at Kirkos Health Center",
    "data": {
        "id": 1,
        "vaccine_id": 2,
        "batch_number": "BN-ABC-001",
        "quantity": 100,
        "min_stock": 20,
        "expiry_date": "2026-12-30T21:00:00.000000Z",
        "manufacturer": "Acme Pharma",
        "supplier": "MoH Central Store",
        "storage_location": "Cold Room A",
        "status": "adequate",
        "created_at": "2026-01-21T20:18:10.000000Z",
        "updated_at": "2026-01-21T20:18:13.000000Z",
        "facility_id": 3,
        "vaccine": {
            "id": 2,
            "code": "OPV-0",
            "name": "OPV 0",
            "dose_number": 1,
            "min_age_days": 0,
            "description": "Oral Polio Vaccine (Birth)",
            "active": 1,
            "created_at": "2026-01-21T18:05:07.000000Z",
            "updated_at": "2026-01-21T18:05:07.000000Z"
        },
        "facility": {
            "id": 3,
            "name": "Kirkos Health Center",
            "location": "Kirkos, Addis Ababa",
            "phone": "011-555-1234",
            "address": "Kirkos Subcity, Main Rd",
            "woreda": "Kirkos",
            "created_at": "2026-01-21T18:28:05.000000Z",
            "updated_at": "2026-01-21T18:28:05.000000Z",
            "registration_code": "KIRKOS-2026",
            "daily_capacity": 50
        },
        "logs": [
            {
                "id": 1,
                "inventory_item_id": 1,
                "facility_id": 3,
                "user_id": 1,
                "type": "receipt",
                "quantity": 100,
                "batch_number": "BN-ABC-001",
                "reason": null,
                "vaccination_record_id": null,
                "notes": "Initial delivery",
                "created_at": "2026-01-21T20:18:13.000000Z",
                "updated_at": "2026-01-21T20:18:13.000000Z"
            }
        ]
    }

### Inventory logs: List logs (new endpoint)
•  Super admin can add facility_id; local admin/nurse are auto-scoped.
GET /v1/inventory/logs?type=receipt&date_from=2026-01-01&date_to=2026-12-31&batch_number=BN-ABC-001&per_page=10
RESPONSE
```
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "inventory_item_id": 1,
                "facility_id": 3,
                "user_id": 1,
                "type": "receipt",
                "quantity": 100,
                "batch_number": "BN-ABC-001",
                "reason": null,
                "vaccination_record_id": null,
                "notes": "Initial delivery",
                "created_at": "2026-01-21T20:18:13.000000Z",
                "updated_at": "2026-01-21T20:18:13.000000Z",
                "inventory_item": {
                    "id": 1,
                    "vaccine_id": 2,
                    "facility_id": 3,
                    "batch_number": "BN-ABC-001",
                    "vaccine": {
                        "id": 2,
                        "name": "OPV 0",
                        "code": "OPV-0"
                    }
                },
                "facility": {
                    "id": 3,
                    "name": "Kirkos Health Center"
                },
                "user": {
                    "id": 1,
                    "name": "Super Admin"
                },
                "vaccination_record": null
            }
        ],
        "first_page_url": "http://vaxtrack-api.test/api/v1/inventory/logs?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://vaxtrack-api.test/api/v1/inventory/logs?page=1",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "page": null,
                "active": false
            },
            {
                "url": "http://vaxtrack-api.test/api/v1/inventory/logs?page=1",
                "label": "1",
                "page": 1,
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "page": null,
                "active": false
            }
        ],
        "next_page_url": null,
        "path": "http://vaxtrack-api.test/api/v1/inventory/logs",
        "per_page": 10,
        "prev_page_url": null,
        "to": 1,
        "total": 1
    }
}

```
### Inventory logs: Single log detail (new endpoint)
GET v1/inventory/logs/1
```
RESPONSE 
```
{
    "success": true,
    "data": {
        "id": 1,
        "inventory_item_id": 1,
        "facility_id": 3,
        "user_id": 1,
        "type": "receipt",
        "quantity": 100,
        "batch_number": "BN-ABC-001",
        "reason": null,
        "vaccination_record_id": null,
        "notes": "Initial delivery",
        "created_at": "2026-01-21T20:18:13.000000Z",
        "updated_at": "2026-01-21T20:18:13.000000Z",
        "inventory_item": {
            "id": 1,
            "vaccine_id": 2,
            "batch_number": "BN-ABC-001",
            "quantity": 100,
            "min_stock": 20,
            "expiry_date": "2026-12-30T21:00:00.000000Z",
            "manufacturer": "Acme Pharma",
            "supplier": "MoH Central Store",
            "storage_location": "Cold Room A",
            "status": "adequate",
            "created_at": "2026-01-21T20:18:10.000000Z",
            "updated_at": "2026-01-21T20:18:13.000000Z",
            "facility_id": 3,
            "vaccine": {
                "id": 2,
                "code": "OPV-0",
                "name": "OPV 0",
                "dose_number": 1,
                "min_age_days": 0,
                "description": "Oral Polio Vaccine (Birth)",
                "active": 1,
                "created_at": "2026-01-21T18:05:07.000000Z",
                "updated_at": "2026-01-21T18:05:07.000000Z"
            }
        },
        "facility": {
            "id": 3,
            "name": "Kirkos Health Center",
            "location": "Kirkos, Addis Ababa",
            "phone": "011-555-1234",
            "address": "Kirkos Subcity, Main Rd",
            "woreda": "Kirkos",
            "created_at": "2026-01-21T18:28:05.000000Z",
            "updated_at": "2026-01-21T18:28:05.000000Z",
            "registration_code": "KIRKOS-2026",
            "daily_capacity": 50
        },
        "user": {
            "id": 1,
            "name": "Super Admin"
        },
        "vaccination_record": null
    }
}
```
### Inventory: Record wastage (facility-scoped)
```
POST /api/v1/inventory/{{ITEM_ID}}/wastage
```
{
    "quantity": 5,
    "reason": "broken_vial",
    "notes": "Dropped during handling"
}
```
response
```
{
    "success": true,
    "message": "Recorded wastage of 5 doses",
    "data": {
        "id": 1,
        "vaccine_id": 2,
        "batch_number": "BN-ABC-001",
        "quantity": 95,
        "min_stock": 20,
        "expiry_date": "2026-12-30T21:00:00.000000Z",
        "manufacturer": "Acme Pharma",
        "supplier": "MoH Central Store",
        "storage_location": "Cold Room A",
        "status": "adequate",
        "created_at": "2026-01-21T20:18:10.000000Z",
        "updated_at": "2026-01-21T20:30:13.000000Z",
        "facility_id": 3,
        "vaccine": {
            "id": 2,
            "code": "OPV-0",
            "name": "OPV 0",
            "dose_number": 1,
            "min_age_days": 0,
            "description": "Oral Polio Vaccine (Birth)",
            "active": 1,
            "created_at": "2026-01-21T18:05:07.000000Z",
            "updated_at": "2026-01-21T18:05:07.000000Z"
        },
        "logs": [
            {
                "id": 2,
                "inventory_item_id": 1,
                "facility_id": 3,
                "user_id": 1,
                "type": "wastage",
                "quantity": -5,
                "batch_number": "BN-ABC-001",
                "reason": "broken_vial",
                "vaccination_record_id": null,
                "notes": "Dropped during handling",
                "created_at": "2026-01-21T20:30:13.000000Z",
                "updated_at": "2026-01-21T20:30:13.000000Z"
            }
        ]
    }
}
```
### Reports: Vaccine audit (new endpoint; joins vaccination_records with inventory_logs)

```
GET /v1/reports/vaccine-audit?facility_id=3&vaccine_id=2&date_from=2026-01-01&date_to=2026-12-31&batch_number=BN-ABC-001&per_page=10
```
response
```
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [],
        "first_page_url": "http://vaxtrack-api.test/api/v1/reports/vaccine-audit?page=1",
        "from": null,
        "last_page": 1,
        "last_page_url": "http://vaxtrack-api.test/api/v1/reports/vaccine-audit?page=1",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "page": null,
                "active": false
            },
            {
                "url": "http://vaxtrack-api.test/api/v1/reports/vaccine-audit?page=1",
                "label": "1",
                "page": 1,
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "page": null,
                "active": false
            }
        ],
        "next_page_url": null,
        "path": "http://vaxtrack-api.test/api/v1/reports/vaccine-audit",
        "per_page": 10,
        "prev_page_url": null,
        "to": null,
        "total": 0
    }
}
```