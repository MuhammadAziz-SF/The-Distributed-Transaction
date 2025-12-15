import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().unique(), // ensures idempotency
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // PENDING, SUCCESS, FAILED
  transactionDate: timestamp('transaction_date', {
    withTimezone: true,
  }).defaultNow(),
});
