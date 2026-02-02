import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add email and user_id columns to organization_invitations table,
 * and add DECLINED status to the status enum.
 */
export class AddEmailUserIdToInvitations1737920000000 implements MigrationInterface {
  name = 'AddEmailUserIdToInvitations1737920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organization_invitations" 
            ADD COLUMN IF NOT EXISTS "user_id" integer
        `);

    await queryRunner.query(`
            ALTER TABLE "organization_invitations" 
            ALTER COLUMN "email" DROP NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "organization_invitations" 
            ADD CONSTRAINT "FK_org_invitations_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TYPE "organization_invitations_status_enum" 
            ADD VALUE IF NOT EXISTS 'declined'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "organization_invitations" 
            DROP CONSTRAINT IF EXISTS "FK_org_invitations_user_id"
        `);

    await queryRunner.query(`
            ALTER TABLE "organization_invitations" 
            DROP COLUMN IF EXISTS "user_id"
        `);

    await queryRunner.query(`
            ALTER TABLE "organization_invitations" 
            ALTER COLUMN "email" SET NOT NULL
        `);

  }
}
