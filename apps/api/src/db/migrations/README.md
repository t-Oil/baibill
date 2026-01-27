# Database Migrations

This directory contains all database migration files for the NestJS application.

## Migration Files

The migrations are ordered by timestamp to ensure they run in the correct sequence:

1. **1729160000001-CreateMsDepartmentsTable.ts**
   - Creates `ms_departments` table (department master data)
   - Creates `active_status_enum` type
   - Includes BaseEntity fields (id, uid, created_by, created_at, updated_by, updated_at, deleted_at, is_active)

2. **1729160000002-CreateMenusTable.ts**
   - Creates `menus` table (hierarchical menu structure)
   - Self-referencing foreign key for parent-child relationship
   - Includes fields: name, route_url, icon, parent_id, ordinal_no, is_show, is_public

3. **1729160000003-CreatePermissionsTable.ts**
   - Creates `permissions` table (permission values)
   - Foreign key to `menus` table
   - Includes field: value, menu_id

4. **1729160000004-CreateRolesTable.ts**
   - Creates `roles` table (user roles for RBAC)
   - Includes fields: name, description, is_default, is_can_delete

5. **1729160000005-CreateRolePermissionsTable.ts**
   - Creates `role_permissions` pivot table
   - Many-to-many relationship between roles and permissions
   - Composite primary key: (role_id, permission_id)

6. **1729160000006-CreateUsersTable.ts**
   - Creates `users` table (user accounts)
   - Enables UUID extension for PostgreSQL
   - Foreign key to `ms_departments` table
   - Includes fields: email, password, first_name, last_name, department_id

7. **1729160000007-CreateUserRolesTable.ts**
   - Creates `user_roles` pivot table
   - Many-to-many relationship between users and roles
   - Composite primary key: (user_id, role_id)

8. **1729160000008-CreateOauthTable.ts**
   - Creates `oauth` table (JWT tokens)
   - Foreign key to `users` table
   - Includes fields: user_id, token, refresh_token

## Running Migrations

### Run all pending migrations
```bash
npm run migration:run
```

### Check migration status
```bash
npm run migration:show
```

### Rollback last migration
```bash
npm run migration:revert
```

## Database Schema Overview

```
ms_departments (master data)
    ↑
    |
users (user accounts)
    ↑                    ↑
    |                    |
oauth (tokens)    user_roles (pivot)
                         ↑
                         |
                    roles (RBAC)
                         ↑
                         |
              role_permissions (pivot)
                         ↑
                         |
                  permissions
                         ↑
                         |
                     menus (hierarchical)
```

## Notes

- All migrations include proper foreign key constraints
- All tables have appropriate indexes for query performance
- Soft deletes are implemented using `deleted_at` timestamp
- UUID fields use PostgreSQL's `uuid_generate_v4()` function
- Active status uses enum type with values: 0 (inactive), 1 (active)

## Important Reminders

- Always run migrations in order (timestamps ensure correct order)
- Test migrations in development/staging before production
- Backup database before running migrations in production
- Each migration includes both `up()` and `down()` methods for rollback capability
