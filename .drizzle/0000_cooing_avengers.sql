CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`brawlhalla_id` integer NOT NULL,
	`name` text NOT NULL,
	`tier` text NOT NULL,
	`old_rank` integer,
	`rank` integer NOT NULL,
	`rating` integer NOT NULL,
	`old_rating` integer,
	`peak_rating` integer NOT NULL,
	`games` integer NOT NULL,
	`wins` integer NOT NULL,
	`bracket` text NOT NULL,
	`region` text NOT NULL,
	`updated_at` text NOT NULL,
	`queuing_since` text
);
