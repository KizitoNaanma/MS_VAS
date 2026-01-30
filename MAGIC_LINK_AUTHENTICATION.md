# Magic Link Authentication Implementation

## Overview

This document describes the magic link authentication feature implemented for phone-based user authentication in the religious notifications API.

## Features

### 1. **Magic Link Token Generation**

- Uses UUID v4 for secure, unique tokens
- Tokens are stored in Redis with a 20-minute TTL
- One-time use only - tokens are deleted after successful verification

### 2. **Authentication Methods**

Added a new enum `PhoneAuthMethodEnum` with two options:

- `PASSWORD`: Traditional password-based authentication
- `MAGIC_LINK`: Passwordless authentication via SMS link (default)

### 3. **Backward Compatibility**

The implementation is backward compatible:

- Default method is `MAGIC_LINK`
- Can be configured to use `PASSWORD` if needed
- Existing password generation is still available when required

### 4. **Religion-Based Portal URLs**

Magic links are sent with the appropriate portal URL based on user's religion:

- Christianity → `CHRISTIAN_PORTAL_URL`
- Islam → `ISLAMIC_PORTAL_URL`

## Implementation Details

### Files Modified

1. **`src/common/enum/auth/index.ts`**

   - Added `PhoneAuthMethodEnum` enum

2. **`src/modules/auth/auth.service.ts`**

   - Updated `signUpWithPhoneNumber()` to accept `authMethod` parameter
   - Added `generateMagicLinkToken()` private method
   - Added `generateMagicLinkForExistingUser()` public method
   - Added `verifyMagicLink()` method for token validation and authentication

3. **`src/modules/auth/auth.controller.ts`**

   - Added `GET /auth/verify-magic-link` endpoint

4. **`src/modules/notification/notification.service.ts`**

   - Added `sendMagicLink()` method to send SMS with magic link

5. **`src/modules/user/user.service.ts`**

   - Updated `UserLookupConfig` interface to include `authMethod`
   - Updated `UserLookupResult` interface to include `magicLinkToken`
   - Modified `findOrCreateUserByPhone()` to handle both new and existing users with magic links

6. **`src/modules/subscription/subscription.service.ts`**
   - Updated `processUserSubscription()` to use magic links by default
   - Updated `processUserRenewal()` to use magic links by default

## API Endpoints

### Verify Magic Link

**GET** `/auth/verify-magic-link?token={token}`

**Query Parameters:**

- `token` (required): The magic link token sent via SMS

**Response:**

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Error Responses:**

- `400 Bad Request`: "Magic link token is required"
- `400 Bad Request`: "Invalid or expired magic link token"
- `400 Bad Request`: "User not found"

## User Flow

### For New Users (Subscription)

1. User sends subscription keyword via SMS
2. System creates user account with generated password
3. System generates magic link token and stores in Redis (20 min TTL)
4. User receives SMS with magic link URL
5. User clicks link → GET request to `/auth/verify-magic-link?token=...`
6. System validates token, deletes it from Redis, and returns auth tokens
7. User is authenticated with access and refresh tokens

### For Existing Users (Renewal/Re-subscription)

1. User sends keyword via SMS
2. System finds existing user
3. System generates new magic link token
4. User receives SMS with magic link URL
5. Same verification flow as above

## Configuration

### Default Authentication Method

The default authentication method is set to `MAGIC_LINK` in:

- `UserService.findOrCreateUserByPhone()`
- `SubscriptionService.processUserSubscription()`
- `SubscriptionService.processUserRenewal()`

### Switching to Password Authentication

To use password-based authentication instead, pass `PhoneAuthMethodEnum.PASSWORD` as the `authMethod` parameter:

```typescript
await this.userService.findOrCreateUserByPhone(msisdn, {
  operation: 'get-or-create',
  religion: service.religion,
  authMethod: PhoneAuthMethodEnum.PASSWORD, // Use password instead
});
```

## Security Features

1. **Short-Lived Tokens**: 20-minute expiration
2. **One-Time Use**: Tokens are deleted after successful verification
3. **Secure Storage**: Tokens stored in Redis with TTL
4. **HTTP-Only Cookies**: Refresh tokens set as HTTP-only cookies
5. **UUID v4**: Cryptographically secure random tokens

## SMS Message Format

### New Signup

```
Welcome! Click this link to login to your account: {portalUrl}/auth/verify-magic-link?token={token}. This link expires in 20 minutes.
```

### Existing User

```
Click this link to login to your account: {portalUrl}/auth/verify-magic-link?token={token}. This link expires in 20 minutes.
```

## Error Handling

The implementation includes specific error messages for:

- Missing token
- Expired token
- Invalid token
- User not found
- Token already used (expired from Redis)

## Testing Considerations

1. **Development Environment**: SMS is logged to console instead of sent
2. **Token Expiration**: Test 20-minute expiration window
3. **One-Time Use**: Verify token cannot be reused
4. **Religion-Based URLs**: Test both Christian and Islamic portal URLs
5. **Backward Compatibility**: Verify password method still works

## Future Enhancements

Potential improvements:

1. Add email-based magic links
2. Add rate limiting for magic link generation
3. Add analytics/tracking for magic link usage
4. Add support for custom expiration times
5. Add support for magic link refresh/resend
