import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Match } from '@commons/validators/match.validator';
import { isDuplicateField } from '@commons/validators/is-duplicate-field.validator';
import { UserRepository } from '@repositories/user.repository';

/**
 * Data transfer object for user registration.
 */
export class RegisterRequest {
    @IsEmail()
    @IsNotEmpty()
    @isDuplicateField(UserRepository, 'email')
    /** User's email address */
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    /** User's password (min 8 chars) */
    password: string;

    @IsString()
    @IsNotEmpty()
    @Match('password')
    /** Password confirmation */
    confirmPassword: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    /** User's first name */
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    /** User's last name */
    lastName: string;
}
