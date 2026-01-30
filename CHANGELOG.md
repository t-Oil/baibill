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

[Unreleased]: https://github.com/t-Oil/baibill/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/t-Oil/baibill/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/t-Oil/baibill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/t-Oil/baibill/releases/tag/v1.0.0
