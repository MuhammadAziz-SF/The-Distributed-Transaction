import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import {
  ORDER_COMMANDS,
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
  UpdateOrderSagaStateDto,
} from '@repo/shared-types';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(ORDER_COMMANDS.CREATE)
  async createOrder(@Payload() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return await this.ordersService.createOrder(dto);
  }

  @MessagePattern(ORDER_COMMANDS.GET)
  async getOrder(
    @Payload() data: { orderId: string },
  ): Promise<OrderResponseDto> {
    return await this.ordersService.getOrder(data.orderId);
  }

  @MessagePattern(ORDER_COMMANDS.CONFIRM)
  async confirmOrder(
    @Payload() data: { orderId: string },
  ): Promise<{ success: boolean }> {
    await this.ordersService.confirmOrder(data.orderId);
    return { success: true };
  }

  @MessagePattern(ORDER_COMMANDS.CANCEL)
  async cancelOrder(
    @Payload() data: { orderId: string },
  ): Promise<{ success: boolean }> {
    await this.ordersService.cancelOrder(data.orderId);
    return { success: true };
  }
}
