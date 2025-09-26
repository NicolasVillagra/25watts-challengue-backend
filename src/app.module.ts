import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { CouponsModule } from './coupons/coupons.module';
import { RedemptionsModule } from './redemptions/redemptions.module';

@Module({
  imports: [CouponsModule, RedemptionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
