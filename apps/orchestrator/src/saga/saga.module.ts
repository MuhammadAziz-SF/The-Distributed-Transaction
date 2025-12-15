import { Module } from '@nestjs/common';
import { SagaOrchestratorService } from './saga-orchestrator.service';
import { SagaStateService } from './saga-state.service';
import { SagaStateRepository } from './saga-state.repository';
import { DbModule } from '../db/db.module';
import { ClientsModuleConfig } from '../clients/clients.module';

@Module({
  imports: [DbModule, ClientsModuleConfig],
  providers: [SagaOrchestratorService, SagaStateService, SagaStateRepository],
  exports: [SagaOrchestratorService],
})
export class SagaModule {}
