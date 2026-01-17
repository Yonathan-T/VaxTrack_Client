# VaxTrack API Documentation

Welcome to the VaxTrack API! This document provides the full endpoint paths to make integration "super easy" for DAWIT MEGERSSA.

## 🌐 Frontend Environment Setup (IMPORTANT)
To avoid hardcoding URLs, save the base URL in your frontend `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://vaxtrackapi.onrender.com/api
```

---

## 🚀 Base Environment
- **Production URL:** `https://vaxtrackapi.onrender.com/api`
- **Development URL:** `http://localhost:8000/api`
- **Prefix Rule:** Most protected routes are versioned under `/v1/`.

---

## 🔐 1. Authentication (Public)
*No token required for these.*

| Full Endpoint Path                     | Method | Description                                  |
| :------------------------------------- | :----- | :------------------------------------------- |
| `/auth/register`                       | `POST` | Parent Sign-up                               |
| `/auth/staff/register`                 | `POST` | Staff Self-Registration (Pending Admin)      |
| `/auth/login`                          | `POST` | Login (Returns Bearer Token)                 |
| `/auth/forgot-password`                | `POST` | Request Reset Link                           |
| `/auth/reset-password`                 | `POST` | Submit New Password                          |
| `/auth/social/google/redirect`         | `GET`  | Google OAuth Start                           |
| `/status`                              | `GET`  | System Health Check                          |

---

## 👪 2. Parent & Common Endpoints
*Requires Bearer Token. Role: `parent`*

| Full Endpoint Path                     | Method | Description                                  |
| :------------------------------------- | :----- | :------------------------------------------- |
| `/v1/user`                             | `GET`  | Profile of the logged-in user                |
| `/v1/user/profile`                     | `PUT`  | Update Name/Email/Phone                      |
| `/v1/parent/dashboard`                 | `GET`  | Children, Progress, & Full Schedule          |
| `/v1/notifications`                    | `GET`  | List Reminders & Alerts                      |
| `/v1/notifications/mark-all-as-read`   | `POST` | Clear Inbox                                  |
| `/v1/auth/logout`                      | `POST` | Terminate Session                            |

---

## 🏥 3. Nurse & Clinical (Smart Visits)
*Requires Bearer Token. Role: `healthcare_worker`*

| Full Endpoint Path                               | Method | Description                                         |
| :----------------------------------------------- | :----- | :-------------------------------------------------- |
| `/v1/children`                                   | `GET`  | List/Search children in your clinic                 |
| `/v1/children`                                   | `POST` | **Register New Child**                              |
| `/v1/children/{id}`                              | `GET`  | Child Info + Visit History                          |
| `/v1/appointments`                               | `GET`  | **Visit List:** Kids due at clinic today            |
| `/v1/appointments/{id}`                          | `GET`  | Specific Visit details + Vaccine list               |
| `/v1/appointments/{id}`                          | `PUT`  | **Reschedule:** Move a visit (Checks capacity)      |
| `/v1/facilities/{facility_id}/capacity`          | `GET`  | Check available slots for a date                    |
| `/v1/vaccination-records/{id}/administer`        | `POST` | **Vaccinate:** Mark a shot as given                 |
| `/v1/inventory`                                  | `GET`  | View facility stock levels                          |
| `/v1/alerts`                                     | `GET`  | View stock warnings (low/expired)                   |

---

## ⚙️ 4. Administration & Management
*Requires Bearer Token. Role: `admin` or `health_official`*

| Full Endpoint Path                     | Method | Description                                  |
| :------------------------------------- | :----- | :------------------------------------------- |
| `/v1/admin/users`                      | `GET`  | List staff/users (scoped to facility)        |
| `/v1/admin/users/{id}`                  | `DELETE`| Remove a user account                       |
| `/v1/admin/facilities`                 | `CRUD` | Manage Health Centers                        |
| `/v1/vaccines`                         | `CRUD` | Define new vaccines & dosages                |
| `/v1/reports/coverage`                 | `GET`  | National/Facility coverage stats             |
| `/v1/inventory/receive`                | `POST` | Add batches to stock                         |

---

## 💡 Frontend Tip
Always include the header: `Authorization: Bearer YOUR_TOKEN_HERE`.
All success responses will typically return a `{"success": true, "data": ...}` wrapper.
