import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { orders, orderItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  CreateOrderDto,
  OrderItemDto,
  OrderStatus,
  SagaState,
} from '@repo/shared-types';

@Injectable()
export class OrdersRepository {
  constructor(private readonly dbService: DbService) {}

  async createOrder(dto: CreateOrderDto) {
    const db = this.dbService.getDb();

    // Insert order and order items in a transaction
    return await db.transaction(async (tx) => {
      // Insert order
      const [order] = await tx
        .insert(orders)
        .values({
          id: dto.orderId,
          userId: dto.userId || null,
          totalAmount: dto.totalAmount.toString(),
          status: OrderStatus.PENDING,
          sagaState: SagaState.ORDER_CREATED,
        })
        .returning();

      // Insert order items
      const items = await tx
        .insert(orderItems)
        .values(
          dto.items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase.toString(),
          })),
        )
        .returning();

      return { order, items };
    });
  }

  async getOrder(orderId: string) {
    const db = this.dbService.getDb();

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const db = this.dbService.getDb();

    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }

  async updateSagaState(orderId: string, sagaState: SagaState) {
    const db = this.dbService.getDb();

    const [updatedOrder] = await db
      .update(orders)
      .set({ sagaState, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }
}
