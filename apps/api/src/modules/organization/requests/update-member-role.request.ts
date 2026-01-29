import { IsNotEmpty, IsNumber } from 'class-validator';

/**
 * Request DTO for updating a member's role.
 */
export class UpdateMemberRoleRequest {
  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}
