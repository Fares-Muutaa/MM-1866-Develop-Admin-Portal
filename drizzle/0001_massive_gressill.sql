CREATE TYPE "public"."role" AS ENUM('Admib', 'User');--> statement-breakpoint
CREATE TABLE "two_factor_auth" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"two_factor_token" varchar(255),
	"two_factor_token_expiry" timestamp,
	"totp_secret" varchar(255),
	"is_two_factor_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'User' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
