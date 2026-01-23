# Super Admin API Setup Guide


## Super Admin Capabilities & Endpoints

### 1) Profile & Password

**Get current user**
`GET /api/v1/user`

**Update profile**
`PUT /api/v1/user/profile`

**Body (any):**

```json
{ "name": "New Name", "email": "new@email.com", "phone": "+2519..." }
```

**Change password**
`PUT /api/v1/user/password`

**Body:**

```json
{
  "old_password": "admin123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Logout**
`POST /api/v1/auth/logout`

### 2) User Management (Super Admin can create any role)

**Route group:** `/api/v1/admin/*` (requires role:admin)


**Create user**
`POST /api/v1/admin/users`

**Body:**

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "health_official",
  "facility_id": 1,
  "phone": "+2519..."
}
```

**Notes:**

- Super Admin can set any role
- Super Admin can set any facility_id or null (global)

**Delete user**
`DELETE /api/v1/admin/users/{userId}`

### 3) Facility Management

**Route group:** `/api/v1/admin/facilities/*` (admin only)

Supports typical REST actions:

- `GET /api/v1/admin/facilities` (list)
- `POST /api/v1/admin/facilities` (create)
- `GET /api/v1/admin/facilities/{facilityId}` (show)
- `PUT /api/v1/admin/facilities/{facilityId}` (update)
- `DELETE /api/v1/admin/facilities/{facilityId}` (delete)
