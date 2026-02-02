import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

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

  entities: ['src/entities/**/*.entity{.ts,.js}'],

  migrations: ['src/db/migrations/**/*{.ts,.js}'],

  seeds: ['src/db/seeds/seeders/**/*{.ts,.js}'],
  factories: ['src/db/seeds/factories/**/*{.ts,.js}'],

  synchronize: false,

  logging: process.env.DB_DEBUG === 'true',

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  migrationsTableName: 'migrations',

  migrationsRun: process.env.DB_AUTO_MIGRATE === 'true',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
