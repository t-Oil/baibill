import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EmailTemplateEntity, EmailTemplateType } from '@entities/email-template.entity';

/**
 * Repository for email template operations.
 */
@Injectable()
export class EmailTemplateRepository extends Repository<EmailTemplateEntity> {
    constructor(private dataSource: DataSource) {
        super(EmailTemplateEntity, dataSource.createEntityManager());
    }

    /**
     * Finds a template by type.
     * @param type Template type enum
     * @returns Template entity or null
     */
    async findByType(type: EmailTemplateType): Promise<EmailTemplateEntity | null> {
        return this.findOne({
            where: { type, isActive: true },
        });
    }

    /**
     * Gets all active templates.
     * @returns Array of active templates
     */
    async findAllActive(): Promise<EmailTemplateEntity[]> {
        return this.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
}
