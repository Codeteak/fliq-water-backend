import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TopUpDepositDto {
  @ApiProperty({ example: 200, description: 'Amount to add to my deposit wallet' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'UPI top-up' })
  @IsOptional()
  @IsString()
  note?: string;
}
