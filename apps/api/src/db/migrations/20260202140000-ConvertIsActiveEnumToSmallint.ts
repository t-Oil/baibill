import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertIsActiveEnumToSmallint20260202140000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE receipts ALTER COLUMN is_active DROP DEFAULT`);
    await queryRunner.query(`
      ALTER TABLE receipts 
      ALTER COLUMN is_active TYPE smallint 
      USING CASE 
        WHEN is_active::text = 'active' THEN 1 
        WHEN is_active::text = 'inactive' THEN 0 
        ELSE 1 
      END
    `);
    await queryRunner.query(`ALTER TABLE receipts ALTER COLUMN is_active SET DEFAULT 1`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_is_active_enum') THEN
          ALTER TABLE users ALTER COLUMN is_active DROP DEFAULT;
          ALTER TABLE users 
          ALTER COLUMN is_active TYPE smallint 
          USING CASE 
            WHEN is_active::text = 'active' THEN 1 
            WHEN is_active::text = 'inactive' THEN 0 
            ELSE 1 
          END;
          ALTER TABLE users ALTER COLUMN is_active SET DEFAULT 1;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organizations_is_active_enum') THEN
          ALTER TABLE organizations ALTER COLUMN is_active DROP DEFAULT;
          ALTER TABLE organizations 
          ALTER COLUMN is_active TYPE smallint 
          USING CASE 
            WHEN is_active::text = 'active' THEN 1 
            WHEN is_active::text = 'inactive' THEN 0 
            ELSE 1 
          END;
          ALTER TABLE organizations ALTER COLUMN is_active SET DEFAULT 1;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_organizations_is_active_enum') THEN
          ALTER TABLE user_organizations ALTER COLUMN is_active DROP DEFAULT;
          ALTER TABLE user_organizations 
          ALTER COLUMN is_active TYPE smallint 
          USING CASE 
            WHEN is_active::text = 'active' THEN 1 
            WHEN is_active::text = 'inactive' THEN 0 
            ELSE 1 
          END;
          ALTER TABLE user_organizations ALTER COLUMN is_active SET DEFAULT 1;
        END IF;
      END $$;
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS receipts_is_active_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS users_is_active_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS organizations_is_active_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_organizations_is_active_enum`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE receipts_is_active_enum AS ENUM ('active', 'inactive')`);
    
    await queryRunner.query(`
      ALTER TABLE receipts 
      ALTER COLUMN is_active TYPE receipts_is_active_enum 
      USING CASE WHEN is_active = 1 THEN 'active'::receipts_is_active_enum ELSE 'inactive'::receipts_is_active_enum END
    `);
    await queryRunner.query(`ALTER TABLE receipts ALTER COLUMN is_active SET DEFAULT 'active'`);
  }
}
