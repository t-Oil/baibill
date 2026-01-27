# JWT Expiration Time Fix

## Issue

@nestjs/jwt version 11+ requires numeric values (in seconds) for the `expiresIn` option when signing tokens. Previously, string values like "5m" or "1h" were supported, but this changed in v10+.

## Error

```
TypeError: expiresIn must be a number
```

This error occurred in `jwtService.sign()` calls in [auth.service.ts](../src/modules/auth/services/auth.service.ts:79-86).

## Solution

### 1. Created Duration Parser Helper

Created [duration.helper.ts](../src/configs/helpers/duration.helper.ts) that converts duration strings to numeric seconds:

- **Supported formats**: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)
- **Examples**:
  - `"30s"` → `30`
  - `"5m"` → `300`
  - `"1h"` → `3600`
  - `"7d"` → `604800`

### 2. Updated Configuration

Modified [configuration.ts](../src/configs/configuration.ts) to parse JWT expiration values:

```typescript
import { parseDuration } from './helpers/duration.helper';

export default () => ({
  // ...
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'accessTokenSecret',
      expire: parseDuration(process.env.JWT_ACCESS_EXPIRE || '5m'), // Now returns number
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecret',
      expire: parseDuration(process.env.JWT_REFRESH_EXPIRE || '10m'), // Now returns number
    },
  },
});
```

### 3. Updated AuthService Types

Changed type declarations in [auth.service.ts](../src/modules/auth/services/auth.service.ts:19-21):

```typescript
// Before
private readonly jwtAccessExpire: string;
private readonly jwtRefreshExpire: string;

// After
private readonly jwtAccessExpire: number;
private readonly jwtRefreshExpire: number;
```

### 4. Fixed Environment Variable Typo

Fixed typo in [.env.example](../.env.example) and [.env.test.example](../.env.test.example):

```bash
# Before (wrong)
JWT_REFRESH__EXPIRE=1h

# After (correct)
JWT_REFRESH_EXPIRE=1h
```

## Files Changed

1. ✅ Created: `src/configs/helpers/duration.helper.ts` - Duration parser utility
2. ✅ Created: `src/configs/helpers/duration.helper.spec.ts` - Unit tests (7/7 passing)
3. ✅ Modified: `src/configs/configuration.ts` - Added parseDuration calls
4. ✅ Modified: `src/modules/auth/services/auth.service.ts` - Changed types from string to number
5. ✅ Modified: `.env.example` - Fixed typo and added documentation
6. ✅ Modified: `.env.test.example` - Fixed typo and added documentation

## Backward Compatibility

✅ **Fully backward compatible** - existing environment variables with string durations continue to work:

```bash
# These still work
JWT_ACCESS_EXPIRE=30m
JWT_REFRESH_EXPIRE=1h

# These also work
JWT_ACCESS_EXPIRE=1800
JWT_REFRESH_EXPIRE=3600
```

## Testing

### Unit Tests

Run the duration helper tests:

```bash
npm test -- duration.helper.spec.ts
```

All 7 tests pass ✅

### TypeScript Compilation

Verify no type errors:

```bash
npx tsc --project tsconfig.build.json --noEmit --skipLibCheck
```

No errors ✅

## Usage Examples

### Current Values in .env.example

```bash
JWT_ACCESS_EXPIRE=30m   # 30 minutes = 1800 seconds
JWT_REFRESH_EXPIRE=1h   # 1 hour = 3600 seconds
```

### Common Duration Values

| String | Numeric | Use Case |
|--------|---------|----------|
| `5m` | `300` | Short-lived access tokens (dev) |
| `15m` | `900` | Standard access tokens |
| `30m` | `1800` | Extended access tokens |
| `1h` | `3600` | Short-lived refresh tokens |
| `24h` | `86400` | Standard refresh tokens |
| `7d` | `604800` | Long-lived refresh tokens |
| `30d` | `2592000` | "Remember me" tokens |

## Migration Guide

### For Existing Projects

1. Copy `duration.helper.ts` to your configs/helpers directory
2. Import and use `parseDuration()` in your configuration
3. Update type declarations from `string` to `number` where JWT expiration is stored
4. No changes needed to `.env` files (they continue to work)

### For New Projects

- Use the duration string format in `.env` files: `5m`, `1h`, `7d`
- The `parseDuration()` helper will automatically convert to numeric seconds
- TypeScript will enforce correct numeric types throughout the codebase

## References

- [@nestjs/jwt v11 Release Notes](https://github.com/nestjs/jwt/releases/tag/v11.0.0)
- [JWT npm package documentation](https://github.com/auth0/node-jsonwebtoken)
- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication#jwt-functionality)
