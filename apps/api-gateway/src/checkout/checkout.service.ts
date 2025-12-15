/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  CheckoutRequestDto,
  CheckoutResponseDto,
} from './../../../../packages/shared-types/src';

@Injectable()
export class CheckoutService {
  private readonly orchestratorUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.orchestratorUrl =
      process.env.ORCHESTRATOR_URL || 'http://localhost:3004';
  }

  async processCheckout(dto: CheckoutRequestDto): Promise<CheckoutResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<CheckoutResponseDto>(
          `${this.orchestratorUrl}/checkout`,
          dto,
        ),
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        // Forward the error from orchestrator
        throw new HttpException(
          error.response.data.message || 'Checkout failed',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Failed to communicate with orchestrator service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.orchestratorUrl}/orders/${orderId}`),
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'Order not found',
          error.response.status || HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        'Failed to communicate with orchestrator service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
