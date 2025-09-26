import { Test } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CouponsController', () => {
  let controller: CouponsController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [
        { provide: CouponsService, useFactory: mockService },
      ],
    }).compile();

    controller = moduleRef.get(CouponsController);
    service = moduleRef.get(CouponsService) as any;
  });

  it('should delegate create', async () => {
    service.create.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.create({} as any)).resolves.toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalled();
  });

  it('should coerce query params to numbers for findAll', async () => {
    service.findAll.mockResolvedValueOnce([]);
    await controller.findAll('active', '5', '10', new Date().toISOString());
    expect(service.findAll).toHaveBeenCalledWith({
      status: 'active',
      minValue: 5,
      maxValue: 10,
      expiresBefore: expect.any(String),
    });
  });

  it('should delegate findOne with parsed id', async () => {
    service.findOne.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
  });

  it('should delegate update and remove', async () => {
    service.update.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.update(1, { description: 'x' } as any)).resolves.toEqual({ id: 1 });

    service.remove.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.remove(1)).resolves.toEqual({ id: 1 });
  });
});
