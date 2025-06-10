// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ 
    enum: UserRole,
    isArray: true,
    default: [UserRole.USER],
    required: false
  })
  @IsArray()
  @IsIn(Object.values(UserRole), { each: true })
  @IsOptional()
  roles?: UserRole[];
}