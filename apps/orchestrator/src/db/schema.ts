import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const sagaLogs = pgTable('saga_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  sagaId: uuid('saga_id').notNull(),
  step: varchar('step', { length: 100 }),
  status: varchar('status', { length: 20 }), // STARTED, COMPLETED, FAILED
  data: jsonb('data'), // request/response details
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sagaState = pgTable('saga_state', {
  sagaId: uuid('saga_id').primaryKey(),
  orderId: uuid('order_id'),
  currentStep: varchar('current_step', { length: 100 }),
  status: varchar('status', { length: 20 }), // RUNNING, DONE, COMPENSATED
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
