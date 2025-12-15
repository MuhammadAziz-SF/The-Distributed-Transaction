CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"stock_quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "stock_quantity_check" CHECK ("products"."stock_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "reservations_order_id_unique" UNIQUE("order_id")
);
