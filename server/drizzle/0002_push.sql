CREATE TABLE `push_subscription` (
	`id` integer PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`expiration_time` real,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	CONSTRAINT "push_subscription_single_row" CHECK("push_subscription"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `scheduled_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`send_at` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`screen` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `scheduled_notifications_send_at` ON `scheduled_notifications` (`send_at`);