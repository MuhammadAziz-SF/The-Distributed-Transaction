CREATE TABLE "saga_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saga_id" uuid NOT NULL,
	"step" varchar(100),
	"status" varchar(20),
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saga_state" (
	"saga_id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid,
	"current_step" varchar(100),
	"status" varchar(20),
	"updated_at" timestamp with time zone DEFAULT now()
);
