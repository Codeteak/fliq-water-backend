import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

const PHONE_REGEX = /^[0-9]{10}$/;

export class DeliveryPartnerLoginDto {
  @ApiProperty({ example: '9876543210', description: '10-digit phone (must match partner account created by admin).' })
  @IsString()
  @Matches(PHONE_REGEX, { message: 'Phone must be 10 digits' })
  phone: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password set when the partner account was created. OTP is not supported for this login.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
