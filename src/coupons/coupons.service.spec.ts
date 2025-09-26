import { Test } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponStatus } from './dto/create-coupon.dto';

const mockPrisma = () => ({
  coupon: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: jest.Mocked<ReturnType<typeof mockPrisma>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: PrismaService, useFactory: mockPrisma },
      ],
    }).compile();

    service = moduleRef.get(CouponsService);
    prisma = moduleRef.get(PrismaService) as any;
  });

  describe('create', () => {
    it('should create a coupon with default active status', async () => {
      const dto = {
        code: 'ABC',
        description: 'desc',
        value: 10,
        expirationDate: new Date().toISOString(),
      };
      const created = { id: 1, status: CouponStatus.active, ...dto, expirationDate: new Date(dto.expirationDate) } as any;
      prisma.coupon.create.mockResolvedValueOnce(created);

      await expect(service.create(dto as any)).resolves.toEqual(created);
      expect(prisma.coupon.create).toHaveBeenCalledWith({
        data: {
          code: dto.code,
          description: dto.description,
          value: dto.value,
          expirationDate: new Date(dto.expirationDate),
          status: CouponStatus.active,
        },
      });
    });

    it('should map prisma error to BadRequestException', async () => {
      prisma.coupon.create.mockRejectedValueOnce(new Error('unique'));
      await expect(
        service.create({ code: 'X', description: '', value: 1, expirationDate: new Date().toISOString() } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should forward filters and return results', async () => {
      const items = [{ id: 1 }] as any;
      prisma.coupon.findMany.mockResolvedValueOnce(items);

      const res = await service.findAll({ status: 'active', minValue: 5, maxValue: 20, expiresBefore: new Date().toISOString() });
      expect(res).toBe(items);
      expect(prisma.coupon.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
    });

    it('should throw BadRequest for invalid expiresBefore', async () => {
      await expect(service.findAll({ expiresBefore: 'invalid-date' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({ id: 1 } as any);
      await expect(service.findOne(1)).resolves.toEqual({ id: 1 });
    });

    it('should throw NotFound when missing', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce(null as any);
      await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update with parsed expirationDate', async () => {
      prisma.coupon.update.mockResolvedValueOnce({ id: 1, status: 'active' } as any);
      const dto = { expirationDate: new Date().toISOString(), description: 'n' } as any;
      await expect(service.update(1, dto)).resolves.toEqual({ id: 1, status: 'active' });
      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          description: 'n',
          expirationDate: expect.any(Date),
        }),
      });
    });

    it('should throw NotFound on prisma error', async () => {
      prisma.coupon.update.mockRejectedValueOnce(new Error('missing'));
      await expect(service.update(1, {} as any)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete by setting status to inactive', async () => {
      prisma.coupon.update.mockResolvedValueOnce({ id: 1, status: CouponStatus.inactive } as any);
      await expect(service.remove(1)).resolves.toEqual({ id: 1, status: CouponStatus.inactive });
      expect(prisma.coupon.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: CouponStatus.inactive } });
    });

    it('should throw NotFound on prisma error', async () => {
      prisma.coupon.update.mockRejectedValueOnce(new Error('missing'));
      await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
