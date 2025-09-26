import { Test } from '@nestjs/testing';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';

const mockService = () => ({
  redeem: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
});

describe('RedemptionsController', () => {
  let controller: RedemptionsController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RedemptionsController],
      providers: [
        { provide: RedemptionsService, useFactory: mockService },
      ],
    }).compile();

    controller = moduleRef.get(RedemptionsController);
    service = moduleRef.get(RedemptionsService) as any;
  });

  it('should delegate redeem', async () => {
    service.redeem.mockResolvedValueOnce({ ok: true } as any);
    await expect(controller.redeem({ code: 'X', user: 'u' } as any)).resolves.toEqual({ ok: true });
    expect(service.redeem).toHaveBeenCalledWith({ code: 'X', user: 'u' });
  });

  it('should delegate findAll and findOne', async () => {
    service.findAll.mockResolvedValueOnce([]);
    await expect(controller.findAll()).resolves.toEqual([]);

    service.findOne.mockResolvedValueOnce({ id: 1 } as any);
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
  });
});
