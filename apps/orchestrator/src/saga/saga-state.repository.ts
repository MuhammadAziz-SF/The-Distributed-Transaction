import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { sagaState, sagaLogs } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SagaStateRepository {
  constructor(private readonly dbService: DbService) {}

  async createSagaState(sagaId: string, orderId: string) {
    const db = this.dbService.getDb();

    const [state] = await db
      .insert(sagaState)
      .values({
        sagaId,
        orderId,
        currentStep: 'ORDER_CREATED',
        status: 'RUNNING',
      })
      .returning();

    return state;
  }

  async getSagaState(sagaId: string) {
    const db = this.dbService.getDb();

    const state = await db.query.sagaState.findFirst({
      where: eq(sagaState.sagaId, sagaId),
    });

    return state;
  }

  async updateSagaStep(sagaId: string, step: string, status: string) {
    const db = this.dbService.getDb();

    const [updated] = await db
      .update(sagaState)
      .set({
        currentStep: step,
        status,
        updatedAt: new Date(),
      })
      .where(eq(sagaState.sagaId, sagaId))
      .returning();

    return updated;
  }

  async logSagaEvent(sagaId: string, step: string, status: string, data: any) {
    const db = this.dbService.getDb();

    const [log] = await db
      .insert(sagaLogs)
      .values({
        sagaId,
        step,
        status,
        data,
      })
      .returning();

    return log;
  }

  async markSagaCompleted(sagaId: string) {
    return await this.updateSagaStep(sagaId, 'COMPLETED', 'DONE');
  }

  async markSagaCompensated(sagaId: string) {
    return await this.updateSagaStep(sagaId, 'COMPENSATED', 'COMPENSATED');
  }
}
