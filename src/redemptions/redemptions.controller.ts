import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('redemptions')
@Controller()
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post('redeem')
  @ApiOperation({ summary: 'Canjear cupón' })
  @ApiCreatedResponse({ description: 'Cupón canjeado' })
  @ApiBadRequestResponse({ description: 'Cupón inválido o expirado' })
  redeem(@Body() dto: RedeemCouponDto) {
    return this.redemptionsService.redeem(dto);
  }

  @Get('redemptions')
  @ApiOperation({ summary: 'Listar historial de canjes' })
  @ApiOkResponse({ description: 'Listado de canjes' })
  findAll() {
    return this.redemptionsService.findAll();
  }

  @Get('redemptions/:id')
  @ApiOperation({ summary: 'Detalle de canje' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.redemptionsService.findOne(id);
  }
}
