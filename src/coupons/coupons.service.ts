import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCouponDto, CouponStatus } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    try {
      const coupon = await this.prisma.coupon.create({
        data: {
          code: dto.code,
          description: dto.description,
          value: dto.value,
          expirationDate: new Date(dto.expirationDate),
          status: dto.status ?? CouponStatus.active,
        },
      });
      return coupon;
    } catch (e: any) {
      // Unique constraint on code, etc.
      throw new BadRequestException(e?.message || 'Error creating coupon');
    }
  }

  async findAll(params: {
    status?: string;
    minValue?: number;
    maxValue?: number;
    expiresBefore?: string;
  }) {
    const { status, minValue, maxValue, expiresBefore } = params;

    const where: any = {};
    if (status) where.status = status;
    if (minValue !== undefined || maxValue !== undefined) {
      where.value = {} as any;
      if (minValue !== undefined) (where.value as any).gte = Number(minValue);
      if (maxValue !== undefined) (where.value as any).lte = Number(maxValue);
    }
    if (expiresBefore) {
      const date = new Date(expiresBefore);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid expiresBefore date');
      }
      where.expirationDate = { lte: date };
    }

    const coupons = await this.prisma.coupon.findMany({ where, orderBy: { id: 'desc' } });
    return coupons;
  }

  async findOne(id: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: number, dto: UpdateCouponDto) {
    // If expirationDate provided, convert to Date
    const data: any = { ...dto };
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate);

    try {
      const updated = await this.prisma.coupon.update({ where: { id }, data });
      return updated;
    } catch (e: any) {
      throw new NotFoundException('Coupon not found');
    }
  }

  async remove(id: number) {
    // soft delete: status -> inactive
    try {
      const updated = await this.prisma.coupon.update({ where: { id }, data: { status: CouponStatus.inactive } });
      return updated;
    } catch (e: any) {
      throw new NotFoundException('Coupon not found');
    }
  }
}
