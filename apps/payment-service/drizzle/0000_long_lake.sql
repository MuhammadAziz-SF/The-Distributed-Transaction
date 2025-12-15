CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"transaction_date" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
);
