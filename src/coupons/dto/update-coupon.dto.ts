import { PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CouponStatus } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;
}
