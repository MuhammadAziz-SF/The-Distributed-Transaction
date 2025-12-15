import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateOrderDto,
  OrderResponseDto,
  ORDER_COMMANDS,
} from '@repo/shared-types';

@Injectable()
export class OrderClientService {
  constructor(@Inject('ORDER_SERVICE') private readonly client: ClientProxy) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    return await firstValueFrom(
      this.client.send<OrderResponseDto>(ORDER_COMMANDS.CREATE, dto),
    );
  }

  async confirmOrder(orderId: string): Promise<OrderResponseDto> {
    return await firstValueFrom(
      this.client.send<OrderResponseDto>(ORDER_COMMANDS.CONFIRM, { orderId }),
    );
  }

  async cancelOrder(orderId: string): Promise<OrderResponseDto> {
    return await firstValueFrom(
      this.client.send<OrderResponseDto>(ORDER_COMMANDS.CANCEL, { orderId }),
    );
  }

  async getOrder(orderId: string): Promise<OrderResponseDto> {
    return await firstValueFrom(
      this.client.send<OrderResponseDto>(ORDER_COMMANDS.GET, { orderId }),
    );
  }
}
