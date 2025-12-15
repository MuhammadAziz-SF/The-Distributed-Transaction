import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import {
  ProcessPaymentDto,
  RefundPaymentDto,
  PaymentResponseDto,
  PaymentStatus,
} from '@repo/shared-types';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async processPayment(dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    // Check if payment already exists (idempotency)
    const existingPayment = await this.paymentsRepository.getPaymentByOrderId(
      dto.orderId,
    );

    if (existingPayment) {
      // Return existing payment (idempotent behavior)
      return {
        id: existingPayment.id,
        orderId: existingPayment.orderId,
        amount: parseFloat(existingPayment.amount),
        status: existingPayment.status as PaymentStatus,
        transactionDate: existingPayment.transactionDate?.toISOString(),
      };
    }

    // Simulate payment gateway call
    const paymentSuccessful = await this.simulatePaymentGateway(dto.amount);

    // Create payment record
    const payment = await this.paymentsRepository.createPayment(
      dto.orderId,
      dto.amount,
      paymentSuccessful ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    );

    if (!paymentSuccessful) {
      throw new BadRequestException('Payment failed - card declined');
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: parseFloat(payment.amount),
      status: payment.status as PaymentStatus,
      transactionDate: payment.transactionDate?.toISOString(),
    };
  }

  async refundPayment(dto: RefundPaymentDto): Promise<{ success: boolean }> {
    const payment = await this.paymentsRepository.getPaymentByOrderId(
      dto.orderId,
    );

    if (!payment) {
      // Idempotent: if payment doesn't exist, consider refund successful
      return { success: true };
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      // Already refunded, idempotent behavior
      return { success: true };
    }

    // Update payment status to REFUNDED
    await this.paymentsRepository.updatePaymentStatus(
      dto.orderId,
      PaymentStatus.REFUNDED,
    );

    return { success: true };
  }

  private async simulatePaymentGateway(amount: number): Promise<boolean> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate 95% success rate
    // In real world, this would call Stripe, PayPal, etc.
    return Math.random() > 0.05;
  }
}
