# VaxTrack Frontend API Integration

This document outlines the complete API integration between the VaxTrack frontend and backend.

## Environment Setup

### Required Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

## API Architecture

### API Client (`lib/api-client.ts`)

The `ApiClient` class provides a singleton pattern for making HTTP requests with automatic token management:

- **Automatic Bearer Token Management**: Tokens are stored in localStorage and automatically included in request headers
- **Error Handling**: Standardized error responses with codes and messages
- **Request Methods**: GET, POST, PUT, DELETE with full type safety

**Usage:**
```typescript
import { apiClient } from "@/lib/api-client"

const { data, error, status } = await apiClient.get<MyType>("/endpoint")
if (error) {
  console.error("API Error:", error.message)
} else {
  // Use data
}
```

## API Modules

### 1. Authentication (`lib/auth-api.ts`)

Handles user authentication flows:

- `loginUser(credentials)` - POST /auth/login
- `registerUser(data)` - POST /auth/register
- `registerStaff(data)` - POST /auth/staff/register
- `getProfile()` - GET /v1/user
- `updateProfile(data)` - PUT /v1/user/profile
- `logoutUser()` - POST /v1/auth/logout
- `resetPassword(email)` - POST /auth/forgot-password
- `submitNewPassword(token, password)` - POST /auth/reset-password

### 2. Parent API (`lib/parent-api.ts`)

Guardian/parent specific endpoints:

- `getParentDashboard()` - GET /v1/parent/dashboard
- `getChildren()` - GET /v1/children
- `getChildDetails(childId)` - GET /v1/children/{id}
- `registerChild(data)` - POST /v1/children
- `getNotifications()` - GET /v1/notifications
- `markNotificationsAsRead()` - POST /v1/notifications/mark-all-as-read
- `logoutParent()` - POST /v1/auth/logout

### 3. Healthcare Worker API (`lib/healthcare-worker-api.ts`)

Nurse/healthcare worker specific endpoints:

- `getChildrenList(searchQuery)` - GET /v1/children
- `getChildProfile(childId)` - GET /v1/children/{id}
- `registerNewChild(data)` - POST /v1/children
- `getAppointmentsList()` - GET /v1/appointments
- `getAppointmentDetails(id)` - GET /v1/appointments/{id}
- `rescheduleAppointment(id, newDate)` - PUT /v1/appointments/{id}
- `getFacilityCapacity(facilityId, date)` - GET /v1/facilities/{id}/capacity
- `administerlVaccine(recordId, data)` - POST /v1/vaccination-records/{id}/administer
- `getInventory()` - GET /v1/inventory
- `getStockAlerts()` - GET /v1/alerts
- `addStock(data)` - POST /v1/inventory/receive

### 4. Admin API (`lib/admin-api.ts`)

Administrator and system management endpoints:

- `getUsers()` - GET /v1/admin/users
- `deleteUser(userId)` - DELETE /v1/admin/users/{id}
- `getFacilities()` - GET /v1/admin/facilities
- `createFacility(data)` - POST /v1/admin/facilities
- `updateFacility(id, data)` - PUT /v1/admin/facilities/{id}
- `getVaccines()` - GET /v1/vaccines
- `createVaccine(data)` - POST /v1/vaccines
- `getCoverageReport(period)` - GET /v1/reports/coverage
- `receiveInventory(data)` - POST /v1/inventory/receive

## Authentication Flow

### Login Flow

```
1. User enters credentials on /login page
2. LoginForm calls loginUser() from auth-api
3. API returns token and user data
4. Token stored in localStorage via apiClient.setToken()
5. User context updated with user data
6. User redirected to /dashboard
```

### Protected Routes

Dashboard routes are protected by:
- `DashboardLayout` checks if user is authenticated
- Unauthenticated users redirected to /login
- User role-based route access controlled via `role-protected.tsx`

### Logout Flow

```
1. User clicks logout button
2. logoutParent() or logoutUser() called (backend session cleanup)
3. Token cleared from localStorage via apiClient.clearToken()
4. User context cleared
5. User redirected to /login
```

## Error Handling

### Error Parsing (`lib/error-handler.ts`)

The `parseApiError()` function converts API errors into user-friendly messages:

```typescript
import { parseApiError } from "@/lib/error-handler"

const { data, error } = await apiClient.post(...)
if (error) {
  const displayConfig = parseApiError(error)
  // Show toast with displayConfig.title and displayConfig.message
}
```

### Common Error Codes

- `NETWORK_ERROR` - Connection failed
- `AUTH_ERROR` - Authentication failed (401)
- `VALIDATION_ERROR` - Invalid input (422)
- `NOT_FOUND` - Resource not found (404)
- `PERMISSION_DENIED` - Access forbidden (403)

## Context Providers

### User Context (`lib/user-context.tsx`)

Manages authenticated user state:

```typescript
const { user, logout, hasRole, isLoading } = useUser()
```

- Automatically verifies token on app load
- Provides role checking utilities
- Handles logout and token clearing

### Children Context (`lib/children-context.tsx`)

Manages child records with API fallback:

```typescript
const { children, refreshChildren, addChild, isLoading, error } = useChildren()
```

- Fetches children from API if authenticated
- Falls back to localStorage/mock data
- Automatically syncs with backend

## Fallback Behavior

The frontend implements graceful degradation:

1. **API Available** - Uses real data from backend
2. **API Unavailable** - Falls back to localStorage cached data
3. **No Cache** - Uses mock data for development/demo purposes

This ensures the app remains functional even if the backend is temporarily unavailable.

## TypeScript Types

All API responses are fully typed:

```typescript
interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

const { data } = await loginUser(credentials)
// data is fully typed as LoginResponse
```

## Testing the Integration

### Check API Connection

```typescript
// In browser console
const { data, error } = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status`)
```

### Mock API Testing

For development without a backend:

1. All API functions return proper error states
2. Frontend gracefully handles network errors
3. Mock data loads as fallback

### Debug Logging

Enable debug mode:

```typescript
// In api-client.ts, uncomment console logs
console.log("[API] Request:", url, options)
console.log("[API] Response:", status, data)
console.log("[API] Error:", error)
```

## Deployment

### Environment Configuration

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.vaxtrack.example.com/api
```

### CORS Configuration

Ensure backend CORS is properly configured to accept requests from your frontend domain.

### Token Security

- Tokens stored in localStorage for persistence
- Consider using httpOnly cookies for production
- Implement token refresh mechanism in `api-client.ts` if needed

## Best Practices

1. **Always handle errors** - Check for error objects before using data
2. **Use proper types** - Leverage TypeScript for type safety
3. **Implement loading states** - Show spinners/skeletons while fetching
4. **Cache responses** - Use context providers to avoid duplicate requests
5. **Log errors** - Help debug with console.error for API failures
6. **Validate inputs** - Check data before sending to API

## Troubleshooting

### "API call returns 401"

Token has expired. User should log in again.

```typescript
// Automatic handling in UserProvider
if (apiError.status === 401) {
  logout()
  router.push("/login")
}
```

### "CORS error"

Backend CORS headers missing. Check backend configuration.

### "Network error"

Check if API URL is correct and backend is running.

```typescript
// Check in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

## Future Enhancements

- [ ] Implement token refresh endpoint
- [ ] Add request/response interceptors
- [ ] Cache API responses with SWR
- [ ] Add request timeout handling
- [ ] Implement rate limiting with retry logic
