import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * Request DTO for creating an organization.
 */
export class CreateOrganizationRequest {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
