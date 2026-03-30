import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryPartnerResponseDto } from '../../../common/swagger/swagger-response.dto';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '9876543210', description: '10-digit login identifier' })
  phone: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Ravi Kumar',
    description: 'Display name when set',
  })
  name: string | null;

  @ApiProperty({
    example: 'customer',
    enum: ['owner', 'admin', 'customer', 'deliveryPartner'],
    description: 'Authorization role for subsequent requests',
  })
  role: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['products', 'orders'],
    description: 'Feature flags for `admin` users; omitted for other roles',
  })
  permissions?: string[];
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token; send as Authorization Bearer',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Opaque refresh token for POST /auth/refresh and /auth/logout',
  })
  refreshToken: string;

  @ApiProperty({
    example: 3600,
    description: 'Access token lifetime in seconds',
  })
  expiresIn: number;

  @ApiPropertyOptional({
    type: UserResponseDto,
    description: 'Authenticated principal after login/register completion',
  })
  user?: UserResponseDto;
}

/** Swagger-only shape for `POST /auth/login-delivery-partner` (no `permissions`; role fixed). */
export class DeliveryPartnerSessionUserDto {
  @ApiProperty({ format: 'uuid', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: '9876543210', description: '10-digit login identifier' })
  phone: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Ravi Kumar',
    description: 'Display name when set',
  })
  name: string | null;

  @ApiProperty({
    enum: ['deliveryPartner'],
    example: 'deliveryPartner',
    description: 'Always `deliveryPartner` for this login response',
  })
  role: 'deliveryPartner';
}

export class DeliveryPartnerAuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token; send as Authorization Bearer',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Opaque refresh token for POST /auth/refresh and /auth/logout',
  })
  refreshToken: string;

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds',
  })
  expiresIn: number;

  @ApiProperty({
    type: DeliveryPartnerSessionUserDto,
    description: 'Partner principal; `permissions` are not returned for this role',
  })
  user: DeliveryPartnerSessionUserDto;

  @ApiProperty({
    type: DeliveryPartnerResponseDto,
    description:
      'Full delivery partner profile including `isAvailable`, vehicle, last known location, and `userId` (same shape as `GET /delivery-partners/me`).',
  })
  deliveryPartner: DeliveryPartnerResponseDto;
}

export class OtpSentResponseDto {
  @ApiProperty({ example: true, description: 'True when OTP SMS path was triggered' })
  sent: boolean;

  @ApiProperty({
    example: 'OTP sent to your phone',
    description: 'Human-readable status; client should prompt for OTP and retry register',
  })
  message: string;
}
