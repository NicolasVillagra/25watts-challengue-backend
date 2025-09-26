import { Module } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsController } from './redemptions.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RedemptionsController],
  providers: [RedemptionsService, PrismaService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
