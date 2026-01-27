import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

// Load environment variables
config();

/**
 * TypeORM DataSource configuration for CLI operations (migrations, seeds)
 * This is used by TypeORM CLI commands like migration:generate, migration:run, etc.
 *
 * Similar to Laravel's database configuration but for TypeORM CLI
 */
const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: (process.env.DB_CONNECTION as 'postgres' | 'mysql') || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nestjs_db',

  // Entity paths - TypeORM will load these entity definitions
  entities: ['src/entities/**/*.entity{.ts,.js}'],

  // Migration paths - where TypeORM looks for migration files
  migrations: ['src/db/migrations/**/*{.ts,.js}'],

  // Seeder paths - for database seeding
  seeds: ['src/db/seeds/seeders/**/*{.ts,.js}'],
  factories: ['src/db/seeds/factories/**/*{.ts,.js}'],

  // IMPORTANT: Set to false in production (use migrations instead)
  synchronize: false,

  // Logging configuration
  logging: process.env.DB_DEBUG === 'true',

  // SSL configuration
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Migration table name (similar to Laravel's 'migrations' table)
  migrationsTableName: 'migrations',

  // Run migrations automatically on application start (optional, similar to Laravel's auto-migrate)
  // Set to false for production - run migrations manually
  migrationsRun: process.env.DB_AUTO_MIGRATE === 'true',
};

// Create and export the DataSource instance
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
