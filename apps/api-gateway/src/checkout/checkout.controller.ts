/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CheckoutRequestDto,
  CheckoutResponseDto,
} from './../../../../packages/shared-types/src';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async checkout(
    @Body() dto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    return await this.checkoutService.processCheckout(dto);
  }

  @Get('orders/:orderId')
  async getOrder(@Param('orderId') orderId: string): Promise<any> {
    return await this.checkoutService.getOrder(orderId);
  }
}
