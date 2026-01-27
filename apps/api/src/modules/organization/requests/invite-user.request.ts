import { IsNotEmpty, IsNumber, IsEmail, ValidateIf } from 'class-validator';

/**
 * Request DTO for inviting a user to an organization.
 * Either userId OR email must be provided (not both required).
 */
export class InviteUserRequest {
    @ValidateIf(o => !o.email)
    @IsNotEmpty({ message: 'Either userId or email is required' })
    @IsNumber()
    userId?: number;

    @ValidateIf(o => !o.userId)
    @IsNotEmpty({ message: 'Either userId or email is required' })
    @IsEmail({}, { message: 'Must be a valid email address' })
    email?: string;

    @IsNotEmpty()
    @IsNumber()
    roleId: number;
}
