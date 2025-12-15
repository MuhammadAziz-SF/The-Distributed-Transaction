import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ProcessPaymentDto,
  PaymentResponseDto,
  PAYMENT_COMMANDS,
} from '@repo/shared-types';

@Injectable()
export class PaymentClientService {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy,
  ) {}

  async processPayment(dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    return await firstValueFrom(
      this.client.send<PaymentResponseDto>(PAYMENT_COMMANDS.PROCESS, dto),
    );
  }

  async refundPayment(orderId: string): Promise<PaymentResponseDto> {
    return await firstValueFrom(
      this.client.send<PaymentResponseDto>(PAYMENT_COMMANDS.REFUND, {
        orderId,
      }),
    );
  }
}
