CREATE TABLE `craving_tags` (
	`fact_id` text NOT NULL,
	`position` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`fact_id`, `position`),
	FOREIGN KEY (`fact_id`) REFERENCES `facts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `facts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`at` integer NOT NULL,
	`received_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`intensity` integer,
	`held_to_end` integer,
	`dose_mg` real,
	`site` text,
	`count` integer,
	CONSTRAINT "facts_type" CHECK("facts"."type" IN ('quit-moment', 'craving', 'patch-application', 'lapse')),
	CONSTRAINT "facts_quit_moment" CHECK("facts"."type" <> 'quit-moment' OR ("facts"."intensity" IS NULL AND "facts"."held_to_end" IS NULL AND "facts"."dose_mg" IS NULL AND "facts"."site" IS NULL AND "facts"."count" IS NULL)),
	CONSTRAINT "facts_craving" CHECK("facts"."type" <> 'craving' OR ("facts"."intensity" IS NOT NULL AND "facts"."intensity" IN (1, 2, 3) AND "facts"."held_to_end" IS NOT NULL AND "facts"."held_to_end" IN (0, 1) AND "facts"."dose_mg" IS NULL AND "facts"."site" IS NULL AND "facts"."count" IS NULL)),
	CONSTRAINT "facts_patch_application" CHECK("facts"."type" <> 'patch-application' OR ("facts"."dose_mg" IS NOT NULL AND "facts"."dose_mg" > 0 AND ("facts"."site" IS NULL OR "facts"."site" IN ('arm-left', 'arm-right', 'chest-left', 'chest-right', 'hip-left', 'hip-right')) AND "facts"."intensity" IS NULL AND "facts"."held_to_end" IS NULL AND "facts"."count" IS NULL)),
	CONSTRAINT "facts_lapse" CHECK("facts"."type" <> 'lapse' OR ("facts"."count" IS NOT NULL AND "facts"."count" >= 1 AND "facts"."intensity" IS NULL AND "facts"."held_to_end" IS NULL AND "facts"."dose_mg" IS NULL AND "facts"."site" IS NULL))
);
--> statement-breakpoint
CREATE TABLE `protocol_steps` (
	`position` integer PRIMARY KEY NOT NULL,
	`dose_mg` real NOT NULL,
	`duration_days` integer NOT NULL,
	`brand` text,
	CONSTRAINT "protocol_steps_position" CHECK("protocol_steps"."position" >= 0),
	CONSTRAINT "protocol_steps_dose_mg" CHECK("protocol_steps"."dose_mg" > 0),
	CONSTRAINT "protocol_steps_duration_days" CHECK("protocol_steps"."duration_days" > 0)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`weekly_spend_cents` integer,
	`baseline_smokes_per_day` integer,
	`goal_label` text,
	`goal_price_cents` integer,
	`goal_counts_from` integer,
	`goal_celebrated` integer,
	`updated_at` integer NOT NULL,
	CONSTRAINT "settings_single_row" CHECK("settings"."id" = 1),
	CONSTRAINT "settings_weekly_spend_cents" CHECK("settings"."weekly_spend_cents" IS NULL OR "settings"."weekly_spend_cents" > 0),
	CONSTRAINT "settings_baseline_smokes_per_day" CHECK("settings"."baseline_smokes_per_day" IS NULL OR "settings"."baseline_smokes_per_day" > 0),
	CONSTRAINT "settings_goal" CHECK(("settings"."goal_label" IS NULL AND "settings"."goal_price_cents" IS NULL AND "settings"."goal_counts_from" IS NULL AND "settings"."goal_celebrated" IS NULL) OR ("settings"."goal_label" IS NOT NULL AND "settings"."goal_price_cents" IS NOT NULL AND "settings"."goal_price_cents" > 0 AND "settings"."goal_celebrated" IS NOT NULL AND "settings"."goal_celebrated" IN (0, 1)))
);
