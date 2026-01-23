# Campaign Management API Guide

## 1) Mark a campaign as completed (or change status)

### Endpoint

```http
PATCH /api/v1/official/campaigns/{campaignId}
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

### Payload Examples

**Mark as completed**

```json
{ "status": "completed" }
```

**Mark as cancelled**

```json
{ "status": "cancelled" }
```

**Mark as active**

```json
{ "status": "active" }
```

You can also update other fields in the same call (title, description, target_region, start_date, end_date, target_vaccine_code).

### Success Response

Returns:

- `success: true`
- `message`
- `data` (the updated campaign)

## 2) Delete a campaign

### Endpoint

```http
DELETE /api/v1/official/campaigns/{campaignId}
Authorization: Bearer <token>
Accept: application/json
```

### Success Response

```json
{ "success": true, "message": "Campaign deleted successfully" }
```
