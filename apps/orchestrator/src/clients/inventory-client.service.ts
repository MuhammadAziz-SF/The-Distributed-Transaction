import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ReserveInventoryDto,
  ReservationResponseDto,
  INVENTORY_COMMANDS,
} from '@repo/shared-types';

@Injectable()
export class InventoryClientService {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly client: ClientProxy,
  ) {}

  async reserveInventory(
    dto: ReserveInventoryDto,
  ): Promise<ReservationResponseDto[]> {
    return await firstValueFrom(
      this.client.send<ReservationResponseDto[]>(
        INVENTORY_COMMANDS.RESERVE,
        dto,
      ),
    );
  }

  async releaseReservation(orderId: string): Promise<void> {
    return await firstValueFrom(
      this.client.send<void>(INVENTORY_COMMANDS.RELEASE, { orderId }),
    );
  }
}
