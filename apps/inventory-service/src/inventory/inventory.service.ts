import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import {
  ReserveInventoryDto,
  ReleaseInventoryDto,
  ReservationResponseDto,
  ReservationStatus,
} from '@repo/shared-types';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async reserveInventory(
    dto: ReserveInventoryDto,
  ): Promise<ReservationResponseDto[]> {
    // Check if reservation already exists (idempotency)
    const existingReservation =
      await this.inventoryRepository.getReservationByOrderId(dto.orderId);

    if (existingReservation) {
      // Return existing reservation (idempotent behavior)
      return [
        {
          id: existingReservation.id,
          orderId: existingReservation.orderId,
          productId: existingReservation.productId,
          quantity: existingReservation.quantity,
          status: existingReservation.status as ReservationStatus,
          expiresAt: existingReservation.expiresAt?.toISOString(),
        },
      ];
    }

    // Validate all products exist and have sufficient stock
    for (const item of dto.items) {
      const product = await this.inventoryRepository.getProduct(item.productId);

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productId}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        );
      }
    }

    // Reserve inventory in transaction (with optimistic locking)
    const reservations =
      await this.inventoryRepository.reserveInventoryInTransaction(
        dto.orderId,
        dto.items,
      );

    return reservations.map((reservation) => ({
      id: reservation.id,
      orderId: reservation.orderId,
      productId: reservation.productId,
      quantity: reservation.quantity,
      status: reservation.status as ReservationStatus,
      expiresAt: reservation.expiresAt?.toISOString(),
    }));
  }

  async releaseReservation(
    dto: ReleaseInventoryDto,
  ): Promise<{ success: boolean }> {
    // Get existing reservation
    const reservation = await this.inventoryRepository.getReservationByOrderId(
      dto.orderId,
    );

    if (!reservation) {
      // Idempotent: if reservation doesn't exist, consider it already released
      return { success: true };
    }

    // Increment stock back
    await this.inventoryRepository.incrementStock(
      reservation.productId,
      reservation.quantity,
    );

    // Delete reservation
    await this.inventoryRepository.deleteReservation(dto.orderId);

    return { success: true };
  }
}
