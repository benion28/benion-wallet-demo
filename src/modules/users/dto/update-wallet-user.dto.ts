import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsArray } from 'class-validator';
import { UserRole } from '../../auth/enums/user-role.enum';
import { CreateWalletUserDto } from './create-wallet-user.dto';

export class UpdateWalletUserDto extends PartialType(CreateWalletUserDto) {
  @ApiProperty({ required: false, description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false, description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false, description: 'User email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: 'User phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ 
    required: false, 
    description: 'User roles',
    enum: UserRole,
    isArray: true,
    default: [UserRole.USER]
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[];

  @ApiProperty({ required: false, description: 'User profile image URL' })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ required: false, description: 'Whether the user is active' })
  @IsOptional()
  isActive?: boolean;
}