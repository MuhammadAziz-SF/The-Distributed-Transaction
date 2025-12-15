import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  timestamp,
  check,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    stockQuantity: integer('stock_quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    version: integer('version').notNull().default(1), // optimistic locking
  },
  (table) => ({
    stockCheck: check('stock_quantity_check', sql`${table.stockQuantity} >= 0`),
  }),
);

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().unique(), // ensures idempotency
  productId: uuid('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // ACTIVE, RELEASED, CONSUMED
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  product: one(products, {
    fields: [reservations.productId],
    references: [products.id],
  }),
}));
