#!/usr/bin/env ts-node
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || process.env.DATABASE_HOST,
  port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432'),
  username: process.env.DB_USERNAME || process.env.DATABASE_USER,
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
  database: process.env.DB_NAME || process.env.DATABASE_NAME,
  entities: [__dirname + '/../entities/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Running pending migrations...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('No pending migrations to run.');
    } else {
      console.log(`Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach(migration => {
        console.log(`  ✓ ${migration.name}`);
      });
    }
    
    await AppDataSource.destroy();
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
