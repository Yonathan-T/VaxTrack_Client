this is the data a nurse could get with this
GET - /v1/children
```
{
    "current_page": 1,
    "data": [
        {
            "id": 1,
            "user_id": 6,
            "registered_by": 4,
            "facility_id": 1,
            "first_name": "Danat",
            "last_name": "Yonathan",
            "date_of_birth": "2025-11-19T21:00:00.000000Z",
            "sex": "male",
            "national_id": null,
            "address": "Lideta Health Center (Lideta District, Street 1)",
            "created_at": "2026-01-16T17:34:39.000000Z",
            "updated_at": "2026-01-16T17:34:39.000000Z",
            "display_address": "Lideta Health Center (Lideta District, Street 1)",
            "facility": {
                "id": 1,
                "name": "Lideta Health Center",
                "location": "Lideta, Addis Ababa",
                "phone": "011-123-4567",
                "address": "Lideta District, Street 1",
                "woreda": null,
                "created_at": "2026-01-15T13:44:58.000000Z",
                "updated_at": "2026-01-15T13:44:58.000000Z",
                "registration_code": "LIDETA-2025",
                "daily_capacity": 50
            }
        },
        {
            "id": 3,
            "user_id": 11,
            "registered_by": 4,
            "facility_id": 1,
            "first_name": "Danat",
            "last_name": "Yonathan",
            "date_of_birth": "2025-11-19T21:00:00.000000Z",
            "sex": "female",
            "national_id": null,
            "address": "Lideta Health Center (Lideta District, Street 1)",
            "created_at": "2026-01-17T14:43:23.000000Z",
            "updated_at": "2026-01-17T14:43:23.000000Z",
            "display_address": "Lideta Health Center (Lideta District, Street 1)",
            "facility": {
                "id": 1,
                "name": "Lideta Health Center",
                "location": "Lideta, Addis Ababa",
                "phone": "011-123-4567",
                "address": "Lideta District, Street 1",
                "woreda": null,
                "created_at": "2026-01-15T13:44:58.000000Z",
                "updated_at": "2026-01-15T13:44:58.000000Z",
                "registration_code": "LIDETA-2025",
                "daily_capacity": 50
            }
        },
        {
            "id": 4,
            "user_id": 11,
            "registered_by": 4,
            "facility_id": 1,
            "first_name": "Jonah",
            "last_name": "Yonathan",
            "date_of_birth": "2022-11-19T21:00:00.000000Z",
            "sex": "male",
            "national_id": null,
            "address": "Lideta Health Center (Lideta District, Street 1)",
            "created_at": "2026-01-17T15:14:00.000000Z",
            "updated_at": "2026-01-17T15:14:00.000000Z",
            "display_address": "Lideta Health Center (Lideta District, Street 1)",
            "facility": {
                "id": 1,
                "name": "Lideta Health Center",
                "location": "Lideta, Addis Ababa",
                "phone": "011-123-4567",
                "address": "Lideta District, Street 1",
                "woreda": null,
                "created_at": "2026-01-15T13:44:58.000000Z",
                "updated_at": "2026-01-15T13:44:58.000000Z",
                "registration_code": "LIDETA-2025",
                "daily_capacity": 50
            }
        }
    ],
    "first_page_url": "http://vaxtrackapi.onrender.com/api/v1/children?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://vaxtrackapi.onrender.com/api/v1/children?page=1",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "page": null,
            "active": false
        },
        {
            "url": "http://vaxtrackapi.onrender.com/api/v1/children?page=1",
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
    "path": "http://vaxtrackapi.onrender.com/api/v1/children",
    "per_page": 20,
    "prev_page_url": null,
    "to": 3,
    "total": 3
}
```
and for each child with thier ID like v1/children/1
```
i get something like this
```
{
    "id": 1,
    "user_id": 6,
    "registered_by": 4,
    "facility_id": 1,
    "first_name": "Danat",
    "last_name": "Yonathan",
    "date_of_birth": "2025-11-19T21:00:00.000000Z",
    "sex": "male",
    "national_id": null,
    "address": "Lideta Health Center (Lideta District, Street 1)",
    "created_at": "2026-01-16T17:34:39.000000Z",
    "updated_at": "2026-01-16T17:34:39.000000Z",
    "display_address": "Lideta Health Center (Lideta District, Street 1)",
    "vaccination_records": [
        {
            "id": 1,
            "child_id": 1,
            "vaccine_id": 1,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2025-11-19T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "overdue",
            "notes": null,
            "created_at": "2026-01-16T17:34:42.000000Z",
            "updated_at": "2026-01-16T17:34:42.000000Z",
            "appointment_id": 1,
            "vaccine": {
                "id": 1,
                "code": "BCG",
                "name": "BCG",
                "dose_number": 1,
                "min_age_days": 0,
                "description": "Tuberculosis vaccine",
                "active": true,
                "created_at": "2026-01-18T11:50:51.000000Z",
                "updated_at": "2026-01-18T11:50:51.000000Z"
            }
        },
        {
            "id": 2,
            "child_id": 1,
            "vaccine_id": 2,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2025-11-19T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "overdue",
            "notes": null,
            "created_at": "2026-01-16T17:34:42.000000Z",
            "updated_at": "2026-01-16T17:34:42.000000Z",
            "appointment_id": 1,
            "vaccine": {
                "id": 2,
                "code": "OPV-0",
                "name": "OPV 0",
                "dose_number": 1,
                "min_age_days": 0,
                "description": "Oral Polio Vaccine (Birth)",
                "active": true,
                "created_at": "2026-01-18T11:50:53.000000Z",
                "updated_at": "2026-01-18T11:50:53.000000Z"
            }
        },
        {
            "id": 3,
            "child_id": 1,
            "vaccine_id": 3,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2025-12-31T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "overdue",
            "notes": null,
            "created_at": "2026-01-16T17:34:44.000000Z",
            "updated_at": "2026-01-16T17:34:44.000000Z",
            "appointment_id": 2,
            "vaccine": {
                "id": 3,
                "code": "PENTA-1",
                "name": "Penta 1",
                "dose_number": 1,
                "min_age_days": 42,
                "description": "DTP-HepB-Hib (Dose 1)",
                "active": true,
                "created_at": "2026-01-18T11:50:53.000000Z",
                "updated_at": "2026-01-18T11:50:53.000000Z"
            }
        },
        {
            "id": 4,
            "child_id": 1,
            "vaccine_id": 4,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2025-12-31T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "overdue",
            "notes": null,
            "created_at": "2026-01-16T17:34:45.000000Z",
            "updated_at": "2026-01-16T17:34:45.000000Z",
            "appointment_id": 2,
            "vaccine": {
                "id": 4,
                "code": "PCV-1",
                "name": "PCV 1",
                "dose_number": 1,
                "min_age_days": 42,
                "description": "Pneumococcal (Dose 1)",
                "active": true,
                "created_at": "2026-01-18T11:50:54.000000Z",
                "updated_at": "2026-01-18T11:50:54.000000Z"
            }
        },
        {
            "id": 5,
            "child_id": 1,
            "vaccine_id": 5,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2025-12-31T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "overdue",
            "notes": null,
            "created_at": "2026-01-16T17:34:46.000000Z",
            "updated_at": "2026-01-16T17:34:46.000000Z",
            "appointment_id": 2,
            "vaccine": {
                "id": 5,
                "code": "ROTA-1",
                "name": "Rota 1",
                "dose_number": 1,
                "min_age_days": 42,
                "description": "Rotavirus (Dose 1)",
                "active": true,
                "created_at": "2026-01-18T11:50:55.000000Z",
                "updated_at": "2026-01-18T11:50:55.000000Z"
            }
        },
        {
            "id": 6,
            "child_id": 1,
            "vaccine_id": 6,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2025-12-31T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "overdue",
            "notes": null,
            "created_at": "2026-01-16T17:34:46.000000Z",
            "updated_at": "2026-01-16T17:34:46.000000Z",
            "appointment_id": 2,
            "vaccine": {
                "id": 6,
                "code": "OPV-1",
                "name": "OPV 1",
                "dose_number": 1,
                "min_age_days": 42,
                "description": "Oral Polio (Dose 1)",
                "active": true,
                "created_at": "2026-01-18T11:50:55.000000Z",
                "updated_at": "2026-01-18T11:50:55.000000Z"
            }
        },
        {
            "id": 7,
            "child_id": 1,
            "vaccine_id": 7,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-01-28T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:48.000000Z",
            "updated_at": "2026-01-16T17:34:48.000000Z",
            "appointment_id": 3,
            "vaccine": {
                "id": 7,
                "code": "PENTA-2",
                "name": "Penta 2",
                "dose_number": 1,
                "min_age_days": 70,
                "description": "DTP-HepB-Hib (Dose 2)",
                "active": true,
                "created_at": "2026-01-18T11:50:56.000000Z",
                "updated_at": "2026-01-18T11:50:56.000000Z"
            }
        },
        {
            "id": 8,
            "child_id": 1,
            "vaccine_id": 8,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-01-28T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:49.000000Z",
            "updated_at": "2026-01-16T17:34:49.000000Z",
            "appointment_id": 3,
            "vaccine": {
                "id": 8,
                "code": "PCV-2",
                "name": "PCV 2",
                "dose_number": 1,
                "min_age_days": 70,
                "description": "Pneumococcal (Dose 2)",
                "active": true,
                "created_at": "2026-01-18T11:50:57.000000Z",
                "updated_at": "2026-01-18T11:50:57.000000Z"
            }
        },
        {
            "id": 9,
            "child_id": 1,
            "vaccine_id": 9,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-01-28T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:50.000000Z",
            "updated_at": "2026-01-16T17:34:50.000000Z",
            "appointment_id": 3,
            "vaccine": {
                "id": 9,
                "code": "ROTA-2",
                "name": "Rota 2",
                "dose_number": 1,
                "min_age_days": 70,
                "description": "Rotavirus (Dose 2)",
                "active": true,
                "created_at": "2026-01-18T11:50:58.000000Z",
                "updated_at": "2026-01-18T11:50:58.000000Z"
            }
        },
        {
            "id": 10,
            "child_id": 1,
            "vaccine_id": 10,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-01-28T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:50.000000Z",
            "updated_at": "2026-01-16T17:34:50.000000Z",
            "appointment_id": 3,
            "vaccine": {
                "id": 10,
                "code": "OPV-2",
                "name": "OPV 2",
                "dose_number": 1,
                "min_age_days": 70,
                "description": "Oral Polio (Dose 2)",
                "active": true,
                "created_at": "2026-01-18T11:50:58.000000Z",
                "updated_at": "2026-01-18T11:50:58.000000Z"
            }
        },
        {
            "id": 11,
            "child_id": 1,
            "vaccine_id": 11,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-02-25T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:52.000000Z",
            "updated_at": "2026-01-16T17:34:52.000000Z",
            "appointment_id": 4,
            "vaccine": {
                "id": 11,
                "code": "PENTA-3",
                "name": "Penta 3",
                "dose_number": 1,
                "min_age_days": 98,
                "description": "DTP-HepB-Hib (Dose 3)",
                "active": true,
                "created_at": "2026-01-18T11:50:59.000000Z",
                "updated_at": "2026-01-18T11:50:59.000000Z"
            }
        },
        {
            "id": 12,
            "child_id": 1,
            "vaccine_id": 12,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-02-25T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:53.000000Z",
            "updated_at": "2026-01-16T17:34:53.000000Z",
            "appointment_id": 4,
            "vaccine": {
                "id": 12,
                "code": "PCV-3",
                "name": "PCV 3",
                "dose_number": 1,
                "min_age_days": 98,
                "description": "Pneumococcal (Dose 3)",
                "active": true,
                "created_at": "2026-01-18T11:51:00.000000Z",
                "updated_at": "2026-01-18T11:51:00.000000Z"
            }
        },
        {
            "id": 13,
            "child_id": 1,
            "vaccine_id": 13,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-02-25T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:53.000000Z",
            "updated_at": "2026-01-16T17:34:53.000000Z",
            "appointment_id": 4,
            "vaccine": {
                "id": 13,
                "code": "OPV-3",
                "name": "OPV 3",
                "dose_number": 1,
                "min_age_days": 98,
                "description": "Oral Polio (Dose 3)",
                "active": true,
                "created_at": "2026-01-18T11:51:00.000000Z",
                "updated_at": "2026-01-18T11:51:00.000000Z"
            }
        },
        {
            "id": 14,
            "child_id": 1,
            "vaccine_id": 14,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-02-25T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:54.000000Z",
            "updated_at": "2026-01-16T17:34:54.000000Z",
            "appointment_id": 4,
            "vaccine": {
                "id": 14,
                "code": "IPV",
                "name": "IPV",
                "dose_number": 1,
                "min_age_days": 98,
                "description": "Inactivated Polio Vaccine",
                "active": true,
                "created_at": "2026-01-18T11:51:01.000000Z",
                "updated_at": "2026-01-18T11:51:01.000000Z"
            }
        },
        {
            "id": 15,
            "child_id": 1,
            "vaccine_id": 15,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2026-08-19T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:56.000000Z",
            "updated_at": "2026-01-16T17:34:56.000000Z",
            "appointment_id": 5,
            "vaccine": {
                "id": 15,
                "code": "MEASLES-1",
                "name": "Measles 1",
                "dose_number": 1,
                "min_age_days": 270,
                "description": "Measles/Rubella (Dose 1)",
                "active": true,
                "created_at": "2026-01-18T11:51:02.000000Z",
                "updated_at": "2026-01-18T11:51:02.000000Z"
            }
        },
        {
            "id": 16,
            "child_id": 1,
            "vaccine_id": 16,
            "facility_id": 1,
            "administered_by": null,
            "dose_number": 1,
            "scheduled_date": "2027-05-19T21:00:00.000000Z",
            "date_administered": null,
            "batch_number": null,
            "status": "scheduled",
            "notes": null,
            "created_at": "2026-01-16T17:34:58.000000Z",
            "updated_at": "2026-01-16T17:34:58.000000Z",
            "appointment_id": 6,
            "vaccine": {
                "id": 16,
                "code": "MEASLES-2",
                "name": "Measles 2",
                "dose_number": 1,
                "min_age_days": 540,
                "description": "Measles/Rubella (Dose 2)",
                "active": true,
                "created_at": "2026-01-18T11:51:03.000000Z",
                "updated_at": "2026-01-18T11:51:03.000000Z"
            }
        }
    ],
    "appointments": [
        {
            "id": 1,
            "child_id": 1,
            "facility_id": 1,
            "created_by": null,
            "scheduled_at": "2025-11-20 00:00:00",
            "type": "vaccination",
            "status": "scheduled",
            "notes": "Standard EPI Birth Visit",
            "created_at": "2026-01-16T17:34:41.000000Z",
            "updated_at": "2026-01-16T17:34:41.000000Z",
            "visit_number": 1
        },
        {
            "id": 2,
            "child_id": 1,
            "facility_id": 1,
            "created_by": null,
            "scheduled_at": "2026-01-01 00:00:00",
            "type": "vaccination",
            "status": "scheduled",
            "notes": "Standard EPI 6 Weeks Visit",
            "created_at": "2026-01-16T17:34:44.000000Z",
            "updated_at": "2026-01-16T17:34:44.000000Z",
            "visit_number": 2
        },
        {
            "id": 3,
            "child_id": 1,
            "facility_id": 1,
            "created_by": null,
            "scheduled_at": "2026-01-29 00:00:00",
            "type": "vaccination",
            "status": "scheduled",
            "notes": "Standard EPI 10 Weeks Visit",
            "created_at": "2026-01-16T17:34:47.000000Z",
            "updated_at": "2026-01-16T17:34:47.000000Z",
            "visit_number": 3
        },
        {
            "id": 4,
            "child_id": 1,
            "facility_id": 1,
            "created_by": null,
            "scheduled_at": "2026-02-26 00:00:00",
            "type": "vaccination",
            "status": "scheduled",
            "notes": "Standard EPI 14 Weeks Visit",
            "created_at": "2026-01-16T17:34:51.000000Z",
            "updated_at": "2026-01-16T17:34:51.000000Z",
            "visit_number": 4
        },
        {
            "id": 5,
            "child_id": 1,
            "facility_id": 1,
            "created_by": null,
            "scheduled_at": "2026-08-20 00:00:00",
            "type": "vaccination",
            "status": "scheduled",
            "notes": "Standard EPI 9 Months Visit",
            "created_at": "2026-01-16T17:34:55.000000Z",
            "updated_at": "2026-01-16T17:34:55.000000Z",
            "visit_number": 5
        },
        {
            "id": 6,
            "child_id": 1,
            "facility_id": 1,
            "created_by": null,
            "scheduled_at": "2027-05-20 00:00:00",
            "type": "vaccination",
            "status": "scheduled",
            "notes": "Standard EPI 18 Months Visit",
            "created_at": "2026-01-16T17:34:57.000000Z",
            "updated_at": "2026-01-16T17:34:57.000000Z",
            "visit_number": 6
        }
    ],
    "facility": {
        "id": 1,
        "name": "Lideta Health Center",
        "location": "Lideta, Addis Ababa",
        "phone": "011-123-4567",
        "address": "Lideta District, Street 1",
        "woreda": null,
        "created_at": "2026-01-15T13:44:58.000000Z",
        "updated_at": "2026-01-15T13:44:58.000000Z",
        "registration_code": "LIDETA-2025",
        "daily_capacity": 50
    }
}
```
### INVENTORY

Register a vaccine this is for admins

POST v1/inventory/receive
{
 "facility_id":2, //take his own facility id instead of adding this
    "vaccine_id": 1,
    "batch_number": "BATCH-2026-X",
    "quantity": 100,
    "expiry_date": "2027-01-01",
    "supplier": "Global Health Supply",
    "notes": "Initial stock for testing"
}
res:
{
    "success": true,
    "message": "Received 100 doses of BCG at Lideta Health Center",
    "data": {
        "id": 1,
        "vaccine_id": 1,
        "batch_number": "BATCH-2026-X",
        "quantity": 100,
        "min_stock": 10,
        "expiry_date": "2026-12-31T21:00:00.000000Z",
        "manufacturer": null,
        "supplier": "Global Health Supply",
        "storage_location": null,
        "status": "adequate",
        "created_at": "2026-01-18T13:31:54.000000Z",
        "updated_at": "2026-01-18T13:31:57.000000Z",
        "facility_id": 1,
        "vaccine": {
            "id": 1,
            "code": "BCG",
            "name": "BCG",
            "dose_number": 1,
            "min_age_days": 0,
            "description": "Tuberculosis vaccine",
            "active": 1,
            "created_at": "2026-01-05T15:00:56.000000Z",
            "updated_at": "2026-01-05T15:00:56.000000Z"
        },
        "facility": {
            "id": 1,
            "name": "Lideta Health Center",
            "location": "Lideta, Addis Ababa",
            "phone": "011-123-4567",
            "address": "Lideta District, Street 1",
            "woreda": null,
            "created_at": "2026-01-05T15:00:57.000000Z",
            "updated_at": "2026-01-05T15:00:57.000000Z",
            "registration_code": "LIDETA-2025",
            "daily_capacity": 50
        },
        "logs": [
            {
                "id": 1,
                "inventory_item_id": 1,
                "facility_id": 1,
                "user_id": 2,
                "type": "receipt",
                "quantity": 100,
                "batch_number": "BATCH-2026-X",
                "reason": null,
                "vaccination_record_id": null,
                "notes": "Initial stock for testing",
                "created_at": "2026-01-18T13:31:57.000000Z",
                "updated_at": "2026-01-18T13:31:57.000000Z"
            }
        ]
    }
}

LOGs INVENTORY
GET v1/inventory/1/logs
```
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "inventory_item_id": 1,
                "facility_id": 1,
                "user_id": 2,
                "type": "receipt",
                "quantity": 100,
                "batch_number": "BATCH-2026-X",
                "reason": null,
                "vaccination_record_id": null,
                "notes": "Initial stock for testing",
                "created_at": "2026-01-18T13:31:57.000000Z",
                "updated_at": "2026-01-18T13:31:57.000000Z",
                "user": {
                    "id": 2,
                    "name": "Lideta Manager"
                }
            }
        ],
        "first_page_url": "http://vaxtrack-api.test/api/v1/inventory/1/logs?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://vaxtrack-api.test/api/v1/inventory/1/logs?page=1",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "page": null,
                "active": false
            },
            {
                "url": "http://vaxtrack-api.test/api/v1/inventory/1/logs?page=1",
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
        "path": "http://vaxtrack-api.test/api/v1/inventory/1/logs",
        "per_page": 20,
        "prev_page_url": null,
        "to": 1,
        "total": 1
    }
}
```

NUrses can see inventory
GET v1/inventory
```
{
    "success": true,
    "data": [
        {
            "id": 1,
            "vaccine": {
                "id": 1,
                "name": "BCG",
                "code": "BCG"
            },
            "facility": {
                "id": 1,
                "name": "Lideta Health Center"
            },
            "batch_number": "BATCH-2026-X",
            "quantity": 100,
            "min_stock": 10,
            "expiry_date": "2027-01-01",
            "manufacturer": null,
            "supplier": "Global Health Supply",
            "storage_location": null,
            "status": "adequate",
            "is_low_stock": false,
            "is_expiring_soon": false,
            "is_expired": false
        }
    ],
    "facility": {
        "id": 1,
        "name": "Lideta Health Center"
    }
}
```

`/v1/alerts` GET  View stock warnings (low/expired)
```
{
    "success": true,
    "data": [],
    "summary": {
        "total": 0,
        "critical": 0,
        "warning": 0,
        "info": 0
    }
}
```