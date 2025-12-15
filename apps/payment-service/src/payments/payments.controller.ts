import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import {
  PAYMENT_COMMANDS,
  ProcessPaymentDto,
  RefundPaymentDto,
  PaymentResponseDto,
} from '@repo/shared-types';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENT_COMMANDS.PROCESS)
  async processPayment(
    @Payload() dto: ProcessPaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentsService.processPayment(dto);
  }

  @MessagePattern(PAYMENT_COMMANDS.REFUND)
  async refundPayment(
    @Payload() dto: RefundPaymentDto,
  ): Promise<{ success: boolean }> {
    return await this.paymentsService.refundPayment(dto);
  }
}
