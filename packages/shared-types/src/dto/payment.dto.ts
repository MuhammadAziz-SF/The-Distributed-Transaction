import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class ProcessPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class RefundPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}

export class PaymentResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionDate?: string;
}
