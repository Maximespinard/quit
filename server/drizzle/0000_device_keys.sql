CREATE TABLE `device_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`issued_at` integer NOT NULL,
	`revoked_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_keys_hash_unique` ON `device_keys` (`hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `device_keys_one_active` ON `device_keys` (("revoked_at" IS NULL)) WHERE "device_keys"."revoked_at" IS NULL;