# VaxTrack Backend Integration Checklist

Use this checklist to verify all API endpoints are properly connected.

## Authentication Endpoints

- [ ] POST `/auth/register` - Parent registration
- [ ] POST `/auth/staff/register` - Staff self-registration
- [ ] POST `/auth/login` - User login with email/password
- [ ] POST `/auth/forgot-password` - Password reset request
- [ ] POST `/auth/reset-password` - Submit new password
- [ ] GET `/status` - System health check

## User Endpoints

- [ ] GET `/v1/user` - Get current user profile
- [ ] PUT `/v1/user/profile` - Update user profile
- [ ] POST `/v1/auth/logout` - Logout current session

## Parent/Guardian Endpoints

- [ ] GET `/v1/parent/dashboard` - Get parent dashboard data
- [ ] GET `/v1/notifications` - List parent notifications
- [ ] POST `/v1/notifications/mark-all-as-read` - Mark notifications as read

## Child Management Endpoints

- [ ] GET `/v1/children` - List children (with optional search)
- [ ] POST `/v1/children` - Register new child
- [ ] GET `/v1/children/{id}` - Get child details
- [ ] PUT `/v1/children/{id}` - Update child information

## Appointment Endpoints

- [ ] GET `/v1/appointments` - List appointments
- [ ] GET `/v1/appointments/{id}` - Get appointment details
- [ ] PUT `/v1/appointments/{id}` - Reschedule appointment
- [ ] GET `/v1/facilities/{facility_id}/capacity` - Check facility capacity

## Vaccination Endpoints

- [ ] POST `/v1/vaccination-records/{id}/administer` - Record vaccine administration
- [ ] GET `/v1/vaccinations` - List vaccinations
- [ ] POST `/v1/vaccinations` - Create vaccination record

## Inventory Endpoints

- [ ] GET `/v1/inventory` - Get facility inventory
- [ ] GET `/v1/alerts` - Get stock alerts (low/expired)
- [ ] POST `/v1/inventory/receive` - Receive new stock batch

## Admin Endpoints

- [ ] GET `/v1/admin/users` - List users (admin view)
- [ ] DELETE `/v1/admin/users/{id}` - Delete user account
- [ ] GET `/v1/admin/facilities` - List facilities
- [ ] POST `/v1/admin/facilities` - Create facility
- [ ] PUT `/v1/admin/facilities/{id}` - Update facility
- [ ] GET `/v1/vaccines` - List vaccine definitions
- [ ] POST `/v1/vaccines` - Create vaccine definition

## Reports Endpoints

- [ ] GET `/v1/reports/coverage` - Get coverage statistics

## Response Format Verification

All endpoints should return responses in this format:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

Or on error:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Error message"
}
```

## Authentication Header

All protected endpoints (prefix `/v1/`) require:

```
Authorization: Bearer <token>
```

Where `<token>` is obtained from `/auth/login` response.

## Testing Credentials (if using demo backend)

```
Email: nurse@demo.com
Password: demo123
Role: healthcare_worker
```

## Common Issues & Solutions

### 401 Unauthorized

**Issue**: Getting 401 on /v1/ endpoints
**Solution**: 
1. Verify token is being sent in Authorization header
2. Check token hasn't expired
3. Login again to get fresh token

### 422 Validation Error

**Issue**: POST/PUT requests failing with 422
**Solution**: 
1. Check all required fields are included
2. Verify field types match API expectations
3. Check error message for specific field issues

### CORS Error

**Issue**: Browser blocks request (preflight failed)
**Solution**:
1. Backend must return proper CORS headers
2. Check backend CORS configuration
3. Ensure frontend origin is whitelisted

### 404 Not Found

**Issue**: Endpoint returns 404
**Solution**:
1. Verify endpoint path is correct
2. Check API version (e.g., `/auth/` vs `/v1/`)
3. Confirm resource ID exists

## Integration Testing Steps

1. **Test Login Flow**
   - Navigate to /login
   - Enter valid credentials
   - Verify token is stored in localStorage
   - Verify redirect to /dashboard

2. **Test Dashboard Loading**
   - Check dashboard stats populate with API data
   - Verify children list loads from /v1/children
   - Verify appointments display correctly

3. **Test Child Operations**
   - Register new child via POST /v1/children
   - View child details via GET /v1/children/{id}
   - Verify data persists after page refresh

4. **Test Logout**
   - Click logout button
   - Verify POST /v1/auth/logout is called
   - Verify redirect to /login
   - Verify token is cleared from storage

5. **Test Error Handling**
   - Disconnect network and try API call
   - Verify fallback to mock data
   - Verify error messages display

## Frontend Components Using Each API

### Authentication
- `components/auth/login-form.tsx` - Uses loginUser()
- `components/auth/register-form.tsx` - Uses registerUser()

### Parent Dashboard
- `components/dashboard/role-dashboard-parent.tsx` - Uses getParentDashboard()
- `components/dashboard/parent-view-children.tsx` - Uses getChildren()

### Healthcare Worker
- `components/dashboard/role-dashboard-health-worker.tsx` - Uses getChildrenList(), getAppointmentsList()
- `components/children/children-list.tsx` - Uses getChildrenList()
- `components/appointments/appointments-list.tsx` - Uses getAppointmentsList()

### Admin
- `components/dashboard/role-dashboard-admin.tsx` - Uses getUsers()
- `app/dashboard/reports/page.tsx` - Uses getCoverageReport()

## Monitoring & Logging

### Enable Debug Logs

In `lib/api-client.ts`, uncomment these lines:

```typescript
console.log("[API] Request to:", url)
console.log("[API] Response status:", status)
if (error) console.error("[API] Error:", error)
```

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Make an API call
4. Click the request to see headers and response

## Performance Optimization

- API responses are cached in context providers
- Use `refreshChildren()` to manually refresh specific data
- Dashboard auto-loads data on mount
- Implement pagination for large lists (future)

## Security Checklist

- [ ] Tokens stored securely (consider httpOnly cookies)
- [ ] API URL uses HTTPS in production
- [ ] Backend validates all inputs
- [ ] Row-level security enforced on backend
- [ ] Rate limiting enabled on backend
- [ ] CORS properly configured
