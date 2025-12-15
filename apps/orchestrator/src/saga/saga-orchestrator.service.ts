import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  CheckoutRequestDto,
  CheckoutResponseDto,
  CreateOrderDto,
  ReserveInventoryDto,
  ProcessPaymentDto,
  SagaState,
} from '@repo/shared-types';
import { OrderClientService } from '../clients/order-client.service';
import { InventoryClientService } from '../clients/inventory-client.service';
import { PaymentClientService } from '../clients/payment-client.service';
import { SagaStateService } from './saga-state.service';

@Injectable()
export class SagaOrchestratorService {
  private readonly logger = new Logger(SagaOrchestratorService.name);

  constructor(
    private readonly orderClient: OrderClientService,
    private readonly inventoryClient: InventoryClientService,
    private readonly paymentClient: PaymentClientService,
    private readonly sagaStateService: SagaStateService,
  ) {}

  async executeCheckout(
    checkoutDto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    const sagaId = uuidv4();
    const orderId = uuidv4();

    this.logger.log(
      `Starting saga ${sagaId} for order ${orderId} - user: ${checkoutDto.userId}`,
    );

    try {
      // Initialize saga
      await this.sagaStateService.createSagaState(sagaId, orderId);

      // Calculate total amount
      const totalAmount = this.calculateTotal(checkoutDto.items);

      // Step 1: Create Order
      await this.executeStep(sagaId, SagaState.ORDER_CREATED, async () => {
        const createOrderDto: CreateOrderDto = {
          orderId,
          userId: checkoutDto.userId,
          items: checkoutDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount,
        };

        return await this.orderClient.createOrder(createOrderDto);
      });

      // Step 2: Reserve Inventory
      await this.executeStep(sagaId, SagaState.INVENTORY_RESERVED, async () => {
        const reserveInventoryDto: ReserveInventoryDto = {
          orderId,
          items: checkoutDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };

        return await this.inventoryClient.reserveInventory(reserveInventoryDto);
      });

      // Step 3: Process Payment
      await this.executeStep(sagaId, SagaState.PAYMENT_PROCESSED, async () => {
        const processPaymentDto: ProcessPaymentDto = {
          orderId,
          amount: totalAmount,
        };

        return await this.paymentClient.processPayment(processPaymentDto);
      });

      // Step 4: Confirm Order
      await this.executeStep(sagaId, SagaState.ORDER_CONFIRMED, async () => {
        return await this.orderClient.confirmOrder(orderId);
      });

      // Mark saga as completed
      await this.sagaStateService.markSagaCompleted(sagaId);

      this.logger.log(`Saga ${sagaId} completed successfully`);

      return {
        success: true,
        orderId,
        message: 'Order placed successfully',
      };
    } catch (error) {
      this.logger.error(`Saga ${sagaId} failed: ${error.message}`, error.stack);

      // Execute compensation
      await this.compensate(sagaId, orderId, error);

      throw error;
    }
  }

  private async executeStep<T>(
    sagaId: string,
    step: SagaState,
    action: () => Promise<T>,
  ): Promise<T> {
    this.logger.log(`Saga ${sagaId} - Executing step: ${step}`);

    await this.sagaStateService.logSagaEvent(sagaId, step, 'STARTED', {});

    try {
      const result = await action();

      await this.sagaStateService.logSagaEvent(sagaId, step, 'COMPLETED', {
        result,
      });
      await this.sagaStateService.updateSagaStep(sagaId, step, 'COMPLETED');

      this.logger.log(`Saga ${sagaId} - Step ${step} completed`);

      return result;
    } catch (error) {
      await this.sagaStateService.logSagaEvent(sagaId, step, 'FAILED', {
        error: error.message,
      });

      this.logger.error(
        `Saga ${sagaId} - Step ${step} failed: ${error.message}`,
      );

      throw error;
    }
  }

  private async compensate(
    sagaId: string,
    orderId: string,
    error: any,
  ): Promise<void> {
    this.logger.log(`Saga ${sagaId} - Starting compensation`);

    try {
      const sagaState = await this.sagaStateService.getSagaState(sagaId);
      const currentStep = sagaState.currentStep;

      // Update saga status to compensating
      await this.sagaStateService.updateSagaStep(
        sagaId,
        SagaState.COMPENSATING,
        'COMPENSATING',
      );

      // Determine what needs compensation based on the step that failed
      // If payment was processed, we need to refund
      if (
        currentStep === SagaState.ORDER_CONFIRMED ||
        currentStep === SagaState.PAYMENT_PROCESSED
      ) {
        this.logger.log(
          `Saga ${sagaId} - Compensation: Refunding payment for order ${orderId}`,
        );
        try {
          await this.paymentClient.refundPayment(orderId);
          await this.sagaStateService.logSagaEvent(
            sagaId,
            'REFUND_PAYMENT',
            'COMPLETED',
            {},
          );
        } catch (refundError) {
          this.logger.error(
            `Saga ${sagaId} - Failed to refund payment: ${refundError.message}`,
          );
          await this.sagaStateService.logSagaEvent(
            sagaId,
            'REFUND_PAYMENT',
            'FAILED',
            { error: refundError.message },
          );
        }
      }

      // If inventory was reserved, we need to release it
      if (
        currentStep === SagaState.ORDER_CONFIRMED ||
        currentStep === SagaState.PAYMENT_PROCESSED ||
        currentStep === SagaState.INVENTORY_RESERVED
      ) {
        this.logger.log(
          `Saga ${sagaId} - Compensation: Releasing inventory for order ${orderId}`,
        );
        try {
          await this.inventoryClient.releaseReservation(orderId);
          await this.sagaStateService.logSagaEvent(
            sagaId,
            'RELEASE_INVENTORY',
            'COMPLETED',
            {},
          );
        } catch (releaseError) {
          this.logger.error(
            `Saga ${sagaId} - Failed to release inventory: ${releaseError.message}`,
          );
          await this.sagaStateService.logSagaEvent(
            sagaId,
            'RELEASE_INVENTORY',
            'FAILED',
            { error: releaseError.message },
          );
        }
      }

      // Always cancel the order if it was created
      if (currentStep !== 'INITIAL') {
        this.logger.log(
          `Saga ${sagaId} - Compensation: Cancelling order ${orderId}`,
        );
        try {
          await this.orderClient.cancelOrder(orderId);
          await this.sagaStateService.logSagaEvent(
            sagaId,
            'CANCEL_ORDER',
            'COMPLETED',
            {},
          );
        } catch (cancelError) {
          this.logger.error(
            `Saga ${sagaId} - Failed to cancel order: ${cancelError.message}`,
          );
          await this.sagaStateService.logSagaEvent(
            sagaId,
            'CANCEL_ORDER',
            'FAILED',
            { error: cancelError.message },
          );
        }
      }

      // Mark saga as compensated
      await this.sagaStateService.markSagaCompensated(sagaId);

      this.logger.log(`Saga ${sagaId} - Compensation completed`);
    } catch (compensationError) {
      this.logger.error(
        `Saga ${sagaId} - Compensation failed: ${compensationError.message}`,
        compensationError.stack,
      );
      // Log the compensation failure but don't throw to avoid masking the original error
      await this.sagaStateService.logSagaEvent(
        sagaId,
        'COMPENSATION',
        'FAILED',
        { error: compensationError.message },
      );
    }
  }

  private calculateTotal(
    items: Array<{ productId: string; quantity: number; price: string }>,
  ): string {
    const total = items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    return total.toFixed(2);
  }
}
