import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cupón' })
  @ApiCreatedResponse({ description: 'Cupón creado' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cupones con filtros' })
  @ApiOkResponse({ description: 'Listado de cupones' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'minValue', required: false, type: Number })
  @ApiQuery({ name: 'maxValue', required: false, type: Number })
  @ApiQuery({ name: 'expiresBefore', required: false, description: 'ISO date string' })
  findAll(
    @Query('status') status?: string,
    @Query('minValue') minValue?: string,
    @Query('maxValue') maxValue?: string,
    @Query('expiresBefore') expiresBefore?: string,
  ) {
    return this.couponsService.findAll({
      status,
      minValue: minValue !== undefined ? Number(minValue) : undefined,
      maxValue: maxValue !== undefined ? Number(maxValue) : undefined,
      expiresBefore,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de cupón' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cupón' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cupón (soft delete → status = inactive)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }
}
