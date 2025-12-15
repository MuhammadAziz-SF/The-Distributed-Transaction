import { Injectable } from '@nestjs/common';
import { CheckoutRequestDto, CheckoutResponseDto } from '@repo/shared-types';
import { SagaOrchestratorService } from '../saga/saga-orchestrator.service';

@Injectable()
export class CheckoutService {
  constructor(private readonly sagaOrchestrator: SagaOrchestratorService) {}

  async processCheckout(dto: CheckoutRequestDto): Promise<CheckoutResponseDto> {
    return await this.sagaOrchestrator.executeCheckout(dto);
  }
}
