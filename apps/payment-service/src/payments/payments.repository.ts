import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { payments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { PaymentStatus } from '@repo/shared-types';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly dbService: DbService) {}

  async getPaymentByOrderId(orderId: string) {
    const db = this.dbService.getDb();

    const payment = await db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });

    return payment;
  }

  async createPayment(orderId: string, amount: number, status: PaymentStatus) {
    const db = this.dbService.getDb();

    const [payment] = await db
      .insert(payments)
      .values({
        orderId,
        amount: amount.toString(),
        status,
      })
      .returning();

    return payment;
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus) {
    const db = this.dbService.getDb();

    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.orderId, orderId))
      .returning();

    return updatedPayment;
  }
}
