CREATE TABLE `site_blocks` (
	`key` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
