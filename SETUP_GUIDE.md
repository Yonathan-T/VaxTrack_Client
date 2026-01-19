the nurse also can do this 
GET v1/nurse/today-due 
```
{
    "success": true,
    "today": "2026-01-18",
    "data": [
        {
            "id": 4,
            "first_name": "Danat",
            "last_name": "Yonathan",
            "date_of_birth": "2025-11-19T21:00:00.000000Z",
            "parent_name": "Yonathan Taweke",
            "parent_phone": "0916887335",
            "total_pending": 16,
            "overdue_count": 6,
            "due_this_week": [],
            "overdue_vaccines": [
                {
                    "id": 49,
                    "child_id": 4,
                    "vaccine_id": 1,
                    "facility_id": 2,
                    "administered_by": null,
                    "dose_number": 1,
                    "scheduled_date": "2025-11-19T21:00:00.000000Z",
                    "date_administered": null,
                    "batch_number": null,
                    "status": "overdue",
                    "notes": null,
                    "created_at": "2026-01-17T14:35:03.000000Z",
                    "updated_at": "2026-01-17T14:35:03.000000Z",
                    "appointment_id": 19,
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
                    }
                },
                {
                    "id": 50,
                    "child_id": 4,
                    "vaccine_id": 2,
                    "facility_id": 2,
                    "administered_by": null,
                    "dose_number": 1,
                    "scheduled_date": "2025-11-19T21:00:00.000000Z",
                    "date_administered": null,
                    "batch_number": null,
                    "status": "overdue",
                    "notes": null,
                    "created_at": "2026-01-17T14:35:03.000000Z",
                    "updated_at": "2026-01-17T14:35:03.000000Z",
                    "appointment_id": 19,
                    "vaccine": {
                        "id": 2,
                        "code": "OPV-0",
                        "name": "OPV 0",
                        "dose_number": 1,
                        "min_age_days": 0,
                        "description": "Oral Polio Vaccine (Birth)",
                        "active": 1,
                        "created_at": "2026-01-05T15:00:56.000000Z",
                        "updated_at": "2026-01-05T15:00:56.000000Z"
                    }
                },
                {
                    "id": 51,
                    "child_id": 4,
                    "vaccine_id": 3,
                    "facility_id": 2,
                    "administered_by": null,
                    "dose_number": 1,
                    "scheduled_date": "2025-12-31T21:00:00.000000Z",
                    "date_administered": null,
                    "batch_number": null,
                    "status": "overdue",
                    "notes": null,
                    "created_at": "2026-01-17T14:35:03.000000Z",
                    "updated_at": "2026-01-17T14:35:03.000000Z",
                    "appointment_id": 20,
                    "vaccine": {
                        "id": 3,
                        "code": "PENTA-1",
                        "name": "Penta 1",
                        "dose_number": 1,
                        "min_age_days": 42,
                        "description": "DTP-HepB-Hib (Dose 1)",
                        "active": 1,
                        "created_at": "2026-01-05T15:00:56.000000Z",
                        "updated_at": "2026-01-05T15:00:56.000000Z"
                    }
                },
                {
                    "id": 52,
                    "child_id": 4,
                    "vaccine_id": 4,
                    "facility_id": 2,
                    "administered_by": null,
                    "dose_number": 1,
                    "scheduled_date": "2025-12-31T21:00:00.000000Z",
                    "date_administered": null,
                    "batch_number": null,
                    "status": "overdue",
                    "notes": null,
                    "created_at": "2026-01-17T14:35:03.000000Z",
                    "updated_at": "2026-01-17T14:35:03.000000Z",
                    "appointment_id": 20,
                    "vaccine": {
                        "id": 4,
                        "code": "PCV-1",
                        "name": "PCV 1",
                        "dose_number": 1,
                        "min_age_days": 42,
                        "description": "Pneumococcal (Dose 1)",
                        "active": 1,
                        "created_at": "2026-01-05T15:00:56.000000Z",
                        "updated_at": "2026-01-05T15:00:56.000000Z"
                    }
                },
                {
                    "id": 53,
                    "child_id": 4,
                    "vaccine_id": 5,
                    "facility_id": 2,
                    "administered_by": null,
                    "dose_number": 1,
                    "scheduled_date": "2025-12-31T21:00:00.000000Z",
                    "date_administered": null,
                    "batch_number": null,
                    "status": "overdue",
                    "notes": null,
                    "created_at": "2026-01-17T14:35:03.000000Z",
                    "updated_at": "2026-01-17T14:35:03.000000Z",
                    "appointment_id": 20,
                    "vaccine": {
                        "id": 5,
                        "code": "ROTA-1",
                        "name": "Rota 1",
                        "dose_number": 1,
                        "min_age_days": 42,
                        "description": "Rotavirus (Dose 1)",
                        "active": 1,
                        "created_at": "2026-01-05T15:00:56.000000Z",
                        "updated_at": "2026-01-05T15:00:56.000000Z"
                    }
                },
                {
                    "id": 54,
                    "child_id": 4,
                    "vaccine_id": 6,
                    "facility_id": 2,
                    "administered_by": null,
                    "dose_number": 1,
                    "scheduled_date": "2025-12-31T21:00:00.000000Z",
                    "date_administered": null,
                    "batch_number": null,
                    "status": "overdue",
                    "notes": null,
                    "created_at": "2026-01-17T14:35:03.000000Z",
                    "updated_at": "2026-01-17T14:35:03.000000Z",
                    "appointment_id": 20,
                    "vaccine": {
                        "id": 6,
                        "code": "OPV-1",
                        "name": "OPV 1",
                        "dose_number": 1,
                        "min_age_days": 42,
                        "description": "Oral Polio (Dose 1)",
                        "active": 1,
                        "created_at": "2026-01-05T15:00:56.000000Z",
                        "updated_at": "2026-01-05T15:00:56.000000Z"
                    }
                }
            ]
        }
    ]
}
```