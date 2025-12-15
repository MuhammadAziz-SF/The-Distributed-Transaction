/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import {
  INVENTORY_COMMANDS,
  ReserveInventoryDto,
  ReleaseInventoryDto,
  ReservationResponseDto,
} from '@repo/shared-types';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern(INVENTORY_COMMANDS.RESERVE)
  async reserveInventory(
    @Payload() dto: ReserveInventoryDto,
  ): Promise<ReservationResponseDto[]> {
    return await this.inventoryService.reserveInventory(dto);
  }

  @MessagePattern(INVENTORY_COMMANDS.RELEASE)
  async releaseReservation(
    @Payload() dto: ReleaseInventoryDto,
  ): Promise<{ success: boolean }> {
    return await this.inventoryService.releaseReservation(dto);
  }
}
