import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum CouponStatus {
  active = 'active',
  inactive = 'inactive',
  redeemed = 'redeemed',
  expired = 'expired',
}

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '10% off for new users' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  expirationDate: string;

  @ApiPropertyOptional({ enum: CouponStatus, default: CouponStatus.active })
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;
}
