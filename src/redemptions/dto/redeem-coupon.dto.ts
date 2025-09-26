import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RedeemCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'user-123' })
  @IsOptional()
  @IsString()
  user?: string;
}
