import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, isEmail, IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @Expose({ name: 'email' })
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
