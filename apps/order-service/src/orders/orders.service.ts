import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderStatus,
  SagaState,
  OrderItemDto,
} from '@repo/shared-types';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const { order, items } = await this.ordersRepository.createOrder(dto);

    return {
      id: order.id,
      userId: order.userId || undefined,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status as OrderStatus,
      sagaState: order.sagaState as SagaState,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: parseFloat(item.priceAtPurchase),
      })),
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getOrder(orderId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.getOrder(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return {
      id: order.id,
      userId: order.userId || undefined,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status as OrderStatus,
      sagaState: order.sagaState as SagaState,
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: parseFloat(item.priceAtPurchase),
      })),
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async confirmOrder(orderId: string): Promise<void> {
    await this.ordersRepository.updateOrderStatus(
      orderId,
      OrderStatus.CONFIRMED,
    );
    await this.ordersRepository.updateSagaState(
      orderId,
      SagaState.ORDER_CONFIRMED,
    );
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.ordersRepository.updateOrderStatus(
      orderId,
      OrderStatus.CANCELLED,
    );
    await this.ordersRepository.updateSagaState(orderId, SagaState.COMPENSATED);
  }

  async updateSagaState(orderId: string, sagaState: SagaState): Promise<void> {
    await this.ordersRepository.updateSagaState(orderId, sagaState);
  }
}
