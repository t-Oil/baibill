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

[Unreleased]: https://github.com/t-Oil/baibill/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/t-Oil/baibill/releases/tag/v1.0.0
