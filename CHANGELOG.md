# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features

- Mobile app (React Native)
- Bulk receipt upload
- Advanced search and filtering
- Custom categories and tags
- Integration with accounting software (QuickBooks, Xero)
- Email-to-receipt functionality
- Receipt templates for different countries
- Multi-language support
- API webhooks
- Receipt splitting for shared expenses

## [1.2.1] - 2026-02-02

### Added

- **API Interceptor Pattern**: Centralized API request handling with automatic header injection
  - New `lib/api.ts` utility with `apiFetch`, `apiGet`, `apiPost`, `apiPut`, `apiDelete` functions
  - Automatically adds Authorization token from localStorage
  - Automatically adds `x-organization-id` header from cookie
  - Eliminates repetitive header management across all pages
  - Provides single point of control for API request configuration

- **Receipt Export Functionality**: Added missing export API route
  - New `GET /api/receipts/export` endpoint for CSV and Excel export
  - Supports search query filtering in exports
  - Properly streams file downloads to client

### Fixed

- **Organization Context**: Fixed missing `x-organization-id` header in receipt-related API calls
  - Updated all Next.js API proxy routes to check both request headers and cookies for organization ID
  - Fixed dashboard page not sending organization header
  - Fixed upload page not sending organization header
  - Fixed receipt detail page not sending organization header
  - Fixed upload count endpoint missing organization header
  - All receipt operations now properly scoped to user's current organization

- **Error Handling**: Improved error response handling for business logic vs HTTP errors
  - Frontend now checks for `error` field in response body before checking HTTP status
  - Properly handles API responses with HTTP 200 + error object (business logic errors)
  - Better error messages for upload limit errors and validation failures
  - Added defensive null checks to prevent "Cannot read properties of undefined" errors

- **TypeScript Build**: Fixed type errors in API utility
  - Changed `HeadersInit` to `Record<string, string>` for proper type safety
  - Fixed implicit 'any' type errors in header assignments
  - Build now completes successfully with zero type errors

### Changed

- **Frontend API Calls**: Migrated all pages to use centralized API utility
  - Dashboard page now uses `apiGet()` for stats and receipts
  - Upload page now uses `apiPost()` and `apiGet()`
  - Receipts page now uses `apiFetch()` for list and export
  - Receipt detail page now uses `apiGet()`
  - Cleaner code with ~50% less boilerplate

- **Debug Logging**: Added comprehensive request/response logging
  - API utility logs all requests with organization ID status
  - Upload page logs full response for debugging
  - Warnings when organization ID cookie is missing

## [1.2.0] - 2026-02-02

### Added

- **Subscription Plans System**: Implemented a flexible, database-driven subscription system
  - New `plans` table with configurable plan features (upload_limit, can_create_org, max_organizations, price, etc.)
  - New `user_subscriptions` table to track user subscriptions with support for expiration, trials, and payment tracking
  - Default plans seeded: Free (3 uploads, no org creation), Pro (unlimited), Business (unlimited + team features)
  - Plan info exposed via `/api/auth/me` endpoint with full plan details

- **Plan-Based Limits**:
  - Upload limit enforcement based on user's subscription plan
  - Organization creation restriction for plans without `canCreateOrg` permission
  - Dynamic limit checking using plan configuration (no hardcoded values)

- **New API Endpoints**:
  - `GET /api/receipts/upload/count` - Get user's current upload count for limit tracking

- **Frontend Plan Features**:
  - Plan badge display on dashboard (shows current plan name)
  - Upload page shows remaining uploads for limited plans
  - Organization creation button disabled with tooltip for restricted plans
  - Dynamic messaging based on plan limits

### Changed

- **Database Schema**: Changed `is_active` columns from PostgreSQL enum type to `smallint` for consistency
  - Affected tables: `receipts`, `users`, `organizations`, `user_organizations`
  - Values: 0 = inactive, 1 = active

- **Architecture**: Removed module exports for subscription checking to avoid circular dependencies
  - Services now inject repositories directly (`PlanRepository`, `UserSubscriptionRepository`)
  - Cleaner dependency graph with no cross-module service imports

- **Error Handling**: Plan limit errors now return HTTP 200 with app-specific error codes
  - `100011`: Upload limit reached
  - `100012`: Cannot create organization (plan restriction)

- **API Security**: Internal database IDs excluded from all API responses
  - Added `@Exclude()` decorator to all internal ID fields (`id`, foreign keys, sensitive fields)
  - Only `uid` (UUID) exposed in public API responses
  - Internal IDs remain available for backend queries and business logic
  - Enabled `ClassSerializerInterceptor` globally for automatic serialization
  - Affected entities: `ReceiptEntity`, `UserEntity`, `OrganizationEntity`, `PlanEntity`, `UserSubscriptionEntity`, `UserOrganizationEntity`, `ReceiptLineItemEntity`, `BaseEntity`

- **Docker Deployment**: Improved migration handling with separate migration service
  - Created standalone migration runner (`run-migrations.ts`) that doesn't bootstrap full NestJS app
  - Separate `Dockerfile.migrations` with source files and dev dependencies
  - Migration service runs once before API starts using Docker Compose `service_completed_successfully` condition
  - Removed `DB_AUTO_MIGRATE` flag to prevent migrations on every restart
  - Prevents API from starting if migrations fail (fail-fast approach)
  - Removed outdated `docker-start.sh` script (replaced by simpler `docker compose up -d`)
  - Updated README.md and README.docker.md with new deployment instructions

### Migrations

- `20260202140000-ConvertIsActiveEnumToSmallint` - Converts enum columns to smallint
- `20260202160000-CreatePlansTable` - Creates plans table with default plans
- `20260202160001-CreateUserSubscriptionsTable` - Creates user_subscriptions table

## [1.1.1] - 2026-01-30

### Fixed

- **Docker Build**: Resolved monorepo build failures by correcting build context and workspace configuration in API Dockerfile
- **Automatic Migrations**: Fixed TypeORM configuration to properly run database migrations on container startup
  - Corrected migration path from `__dirname + './../../db/migrations/*'` to `__dirname + '/../../db/migrations/*'`
  - Fixed boolean comparison bug causing migrations to be skipped (string comparison → boolean comparison)
- **Nginx Configuration**: Removed duplicate server block that was causing 404 errors on root path
- **Network Conflicts**: Changed Docker network subnet from 172.20.0.0/16 to 172.29.0.0/16 to avoid address space conflicts

### Changed

- **Default Ports**: Updated exposed ports from 80/443 to 8181/8443 to prevent conflicts with other services
- **API URL**: Updated `NEXT_PUBLIC_API_URL` configuration to match new port (http://localhost:8181/api)

### Added

- **Docker Documentation**: Comprehensive Docker deployment guide (README.docker.md) including:
  - Quick start guide with step-by-step setup instructions
  - Database seeder commands for first-time initialization
  - OCR provider configuration (OpenAI GPT-4o and Google Cloud Vision)
  - Email service configuration (Mailjet)
  - Environment variables reference table
  - Production deployment checklist with security best practices
  - Automatic migrations documentation
  - Custom port configuration guide
- **Secrets Management**: Added volume mount for GCP Vision API credentials (`apps/api/secrets/`)
- **Environment Template**: Created `.env.docker.example` with comprehensive configuration examples and security notes
- **Seeder Documentation**: Added instructions for resolving circular dependency in initial database setup

## [1.1.0] - 2026-01-28

### Added

- **Security Scans**: Implemented automated scanning for sensitive data (keys, credentials) in the codebase.
- **Form Validation**: Refactored frontend forms (Login, Organization, Invitation) to use `react-hook-form` and `zod` for robust schema validation and better UX.
- **Event-Driven Architecture**: Refactored the email sending system to use `@nestjs/event-emitter`.
  - Added `OrganizationInviteEvent`, `UserWelcomeEvent`, and `EmailConfirmationEvent`.
  - Implemented `MailListener` to decouple email logic from business services.
- **Member Management**:
  - Implemented automatic linking of pending email invitations to new user accounts upon registration.
  - Enhanced member onboarding flow to immediately add invited users to organizations after signup.

### Changed

- **Branding**: Updated application branding to "BaiBill" with consistent dark theme and color palette.
- **Code Quality**:
  - Removed all `console.log` statements and commented-out code.
  - Standardized inline comments and added JSDoc documentation to all services and controllers.
  - Enforced consistent 2-space indentation across the entire codebase using Prettier.
  - Removed unused dependencies and cleaned up the `packages` directory.
- **MailService**: Decoupled `MailService` from `AuthService`, `UserService`, and `OrganizationService`. It is no longer exported globally to enforce event-based usage.
- **Database Templates**: Migrated email templates to be fully database-driven, removing hardcoded fallbacks for better manageability.

### Fixed

- **PDF OCR**: Resolved `pdf-parse` issues to enable correct text extraction from PDF receipts.
- **Build Errors**: Fixed TypeScript errors in `apps/api` related to removed `MailService` methods by updating all consumers to use events.

## [1.0.0] - 2026-01-27

### Added

- Initial release of Receipt OCR
- **OCR Processing**
  - Google Cloud Vision API integration
  - OpenAI GPT-4 Vision integration
  - Automatic text extraction from receipt images
  - Support for multiple currencies and formats
  - Item-level data extraction

- **Receipt Management**
  - Upload receipt images (JPG, PNG, PDF)
  - View detailed receipt information
  - List all receipts with pagination
  - Search and filter receipts by date, merchant, amount
  - Export receipts to Excel/CSV

- **Dashboard & Analytics**
  - Real-time statistics dashboard
  - Total spending tracking
  - Weekly and monthly summaries
  - Average receipt amount calculation
  - Recent receipts overview

- **User Management**
  - User registration and authentication
  - Email verification system
  - JWT-based authentication with refresh tokens
  - Password reset functionality
  - User profile management

- **Organization Management**
  - Create and manage multiple organizations
  - Role-based access control (Admin, Member)
  - Invite users to organizations via email
  - Switch between organizations
  - Organization settings management

- **Security Features**
  - JWT authentication with access and refresh tokens
  - Bcrypt password hashing
  - CORS protection
  - Rate limiting (10 req/s for API, 30 req/s for frontend)
  - Security headers (X-Frame-Options, CSP, XSS Protection)
  - SQL injection prevention with TypeORM
  - Environment variable management

- **Deployment & Infrastructure**
  - Docker Compose configuration
  - Nginx reverse proxy setup
  - PostgreSQL database with migrations
  - Health checks for all services
  - SSL/HTTPS support
  - Container security hardening
  - Automated backup scripts

- **Developer Experience**
  - Monorepo structure with npm workspaces
  - TypeScript for end-to-end type safety
  - Shared DTOs between frontend and backend
  - RESTful API with Swagger/OpenAPI documentation
  - Database migrations with TypeORM
  - E2E testing with Playwright
  - Unit testing with Jest
  - ESLint and Prettier configuration

- **Frontend (Next.js)**
  - Server-side rendering with Next.js 15
  - Responsive design with Tailwind CSS
  - Dark mode support
  - Dashboard with statistics
  - Receipt upload interface
  - Receipt list and detail views
  - Organization management UI
  - Authentication pages (login, register, verify email)

- **Backend (NestJS)**
  - RESTful API architecture
  - Modular structure
  - Repository pattern
  - Service layer
  - Exception handling
  - Validation with class-validator
  - API documentation with Swagger

- **Documentation**
  - Comprehensive README.md
  - Docker deployment guide (README.docker.md)
  - Contributing guidelines (CONTRIBUTING.md)
  - API documentation (Swagger)
  - Code comments and JSDoc
  - Setup and configuration instructions

### Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Node.js 20
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Authentication**: JWT, bcrypt
- **OCR**: Google Cloud Vision API, OpenAI GPT-4 Vision
- **Reverse Proxy**: Nginx
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest, Playwright
- **Documentation**: Swagger/OpenAPI

### Security Improvements

- Non-root container users
- Read-only filesystems
- Dropped Linux capabilities
- Rate limiting
- Security headers
- SSL/TLS support

## Version History

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Schedule

- **Major releases**: Annually or as needed for breaking changes
- **Minor releases**: Quarterly or as needed for new features
- **Patch releases**: As needed for bug fixes and security updates

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Support

- 📖 [Documentation](README.md)
- 🐛 [Issue Tracker](https://github.com/t-Oil/baibill/issues)
- 💬 [Discussions](https://github.com/t-Oil/baibill/discussions)

---

[Unreleased]: https://github.com/t-Oil/baibill/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/t-Oil/baibill/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/t-Oil/baibill/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/t-Oil/baibill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/t-Oil/baibill/releases/tag/v1.0.0
