import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';

@Injectable()
export class RedemptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async redeem(dto: RedeemCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    // Validate specific status first to avoid narrowing conflicts
    if (coupon.status === 'redeemed') {
      throw new BadRequestException('Coupon already redeemed');
    }

    if (coupon.status !== 'active') {
      throw new BadRequestException('Coupon is not active');
    }

    const now = new Date();
    if (coupon.expirationDate < now) {
      throw new BadRequestException('Coupon is expired');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.create({
        data: {
          couponId: coupon.id,
          user: dto.user,
          status: 'success',
        },
        include: { coupon: true },
      });

      await tx.coupon.update({ where: { id: coupon.id }, data: { status: 'redeemed' } });
      return redemption;
    });

    return { message: 'Coupon redeemed successfully', redemption: result };
  }

  async findAll() {
    return this.prisma.redemption.findMany({ include: { coupon: true }, orderBy: { id: 'desc' } });
  }

  async findOne(id: number) {
    const redemption = await this.prisma.redemption.findUnique({ where: { id }, include: { coupon: true } });
    if (!redemption) throw new NotFoundException('Redemption not found');
    return redemption;
  }
}

