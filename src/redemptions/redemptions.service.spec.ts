import { Test } from '@nestjs/testing';
import { RedemptionsService } from './redemptions.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrisma = () => ({
  coupon: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  redemption: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe('RedemptionsService', () => {
  let service: RedemptionsService;
  let prisma: jest.Mocked<ReturnType<typeof mockPrisma>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RedemptionsService,
        { provide: PrismaService, useFactory: mockPrisma },
      ],
    }).compile();

    service = moduleRef.get(RedemptionsService);
    prisma = moduleRef.get(PrismaService) as any;
  });

  describe('redeem', () => {
    it('should throw NotFound if coupon does not exist', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce(null as any);
      await expect(service.redeem({ code: 'X', user: 'u' } as any)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw if already redeemed', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({ id: 1, status: 'redeemed', expirationDate: new Date(Date.now() + 10000) } as any);
      await expect(service.redeem({ code: 'X', user: 'u' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw if not active', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({ id: 1, status: 'inactive', expirationDate: new Date(Date.now() + 10000) } as any);
      await expect(service.redeem({ code: 'X', user: 'u' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw if expired', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({ id: 1, status: 'active', expirationDate: new Date(Date.now() - 1000) } as any);
      await expect(service.redeem({ code: 'X', user: 'u' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should redeem successfully via transaction', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({ id: 2, status: 'active', expirationDate: new Date(Date.now() + 10000) } as any);

      // mock $transaction execution, providing a tx with needed methods
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          redemption: { create: jest.fn().mockResolvedValue({ id: 5, couponId: 2, status: 'success', coupon: { id: 2 } }) },
          coupon: { update: jest.fn().mockResolvedValue({ id: 2, status: 'redeemed' }) },
        } as any;
        return fn(tx);
      });

      const res = await service.redeem({ code: 'OK', user: 'john' } as any);
      expect(res).toEqual({ message: 'Coupon redeemed successfully', redemption: expect.objectContaining({ id: 5 }) });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return list', async () => {
      prisma.redemption.findMany.mockResolvedValueOnce([{ id: 1 }] as any);
      await expect(service.findAll()).resolves.toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return entity', async () => {
      prisma.redemption.findUnique.mockResolvedValueOnce({ id: 1 } as any);
      await expect(service.findOne(1)).resolves.toEqual({ id: 1 });
    });

    it('should throw NotFound when missing', async () => {
      prisma.redemption.findUnique.mockResolvedValueOnce(null as any);
      await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
