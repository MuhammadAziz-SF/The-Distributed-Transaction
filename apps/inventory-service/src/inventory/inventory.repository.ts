/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, ConflictException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { products, reservations } from '../db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { ReservationStatus } from '@repo/shared-types';

@Injectable()
export class InventoryRepository {
  constructor(private readonly dbService: DbService) {}

  async getProduct(productId: string) {
    const db = this.dbService.getDb();

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    return product;
  }

  async getReservationByOrderId(orderId: string) {
    const db = this.dbService.getDb();

    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.orderId, orderId),
    });

    return reservation;
  }

  async decrementStockWithLocking(productId: string, quantity: number) {
    const db = this.dbService.getDb();

    // Use optimistic locking: decrement stock and increment version
    // Only succeeds if stock is sufficient
    const result = await db
      .update(products)
      .set({
        stockQuantity: sql`stock_quantity - ${quantity}`,
        version: sql`version + 1`,
      })
      .where(
        and(eq(products.id, productId), gte(products.stockQuantity, quantity)),
      )
      .returning();

    if (result.length === 0) {
      throw new ConflictException(
        'Insufficient stock or concurrent update conflict',
      );
    }

    return result[0];
  }

  async incrementStock(productId: string, quantity: number) {
    const db = this.dbService.getDb();

    const result = await db
      .update(products)
      .set({
        stockQuantity: sql`stock_quantity + ${quantity}`,
        version: sql`version + 1`,
      })
      .where(eq(products.id, productId))
      .returning();

    return result[0];
  }

  async createReservation(
    orderId: string,
    productId: string,
    quantity: number,
  ) {
    const db = this.dbService.getDb();

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const [reservation] = await db
      .insert(reservations)
      .values({
        orderId,
        productId,
        quantity,
        status: ReservationStatus.ACTIVE,
        expiresAt,
      })
      .returning();

    return reservation;
  }

  async deleteReservation(orderId: string) {
    const db = this.dbService.getDb();

    const [deleted] = await db
      .delete(reservations)
      .where(eq(reservations.orderId, orderId))
      .returning();

    return deleted;
  }

  async reserveInventoryInTransaction(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
  ) {
    const db = this.dbService.getDb();

    return await db.transaction(async (tx) => {
      const createdReservations = [];

      for (const item of items) {
        // Decrement stock with optimistic locking
        await this.decrementStockWithLocking(item.productId, item.quantity);

        // Create reservation
        const reservation = await this.createReservation(
          orderId,
          item.productId,
          item.quantity,
        );

        createdReservations.push(reservation);
      }

      return createdReservations;
    });
  }
}
