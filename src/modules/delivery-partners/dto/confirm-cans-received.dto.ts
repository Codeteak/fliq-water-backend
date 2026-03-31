import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmCansReceivedDto {
  @ApiPropertyOptional({
    description: 'Optional note saved as delivery notes while confirming can return',
    example: 'Customer returned 3 empty cans at doorstep',
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
