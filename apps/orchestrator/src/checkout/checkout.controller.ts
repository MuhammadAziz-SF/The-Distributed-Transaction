import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutRequestDto, CheckoutResponseDto } from '@repo/shared-types';
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
}
