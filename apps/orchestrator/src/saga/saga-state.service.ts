import { Injectable } from '@nestjs/common';
import { SagaStateRepository } from './saga-state.repository';

@Injectable()
export class SagaStateService {
  constructor(private readonly sagaStateRepository: SagaStateRepository) {}

  async createSagaState(sagaId: string, orderId: string) {
    return await this.sagaStateRepository.createSagaState(sagaId, orderId);
  }

  async getSagaState(sagaId: string) {
    return await this.sagaStateRepository.getSagaState(sagaId);
  }

  async updateSagaStep(sagaId: string, step: string, status: string) {
    return await this.sagaStateRepository.updateSagaStep(sagaId, step, status);
  }

  async logSagaEvent(
    sagaId: string,
    step: string,
    status: string,
    data: any = {},
  ) {
    return await this.sagaStateRepository.logSagaEvent(
      sagaId,
      step,
      status,
      data,
    );
  }

  async markSagaCompleted(sagaId: string) {
    return await this.sagaStateRepository.markSagaCompleted(sagaId);
  }

  async markSagaCompensated(sagaId: string) {
    return await this.sagaStateRepository.markSagaCompensated(sagaId);
  }
}
