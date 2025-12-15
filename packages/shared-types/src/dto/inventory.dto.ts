import { IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '../enums/reservation-status.enum';

export class ReservationItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ReserveInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items: ReservationItemDto[];
}

export class ReleaseInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}

export class ReservationResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  orderId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  status: ReservationStatus;

  @IsNotEmpty()
  expiresAt?: string;
}
