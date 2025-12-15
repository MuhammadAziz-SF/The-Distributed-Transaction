import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enums/order-status.enum';
import { SagaState } from '../enums/saga-state.enum';

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  priceAtPurchase: number;
}

export class CreateOrderDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class OrderResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsNumber()
  totalAmount: number;

  @IsString()
  status: OrderStatus;

  @IsString()
  @IsOptional()
  sagaState?: SagaState;

  @IsArray()
  items: OrderItemDto[];

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

export class UpdateOrderStatusDto {
  @IsUUID()
  orderId: string;

  @IsString()
  status: OrderStatus;
}

export class UpdateOrderSagaStateDto {
  @IsUUID()
  orderId: string;

  @IsString()
  sagaState: SagaState;
}
