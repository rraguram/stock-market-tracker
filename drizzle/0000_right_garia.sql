CREATE TABLE `portfolio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`purchase_price` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
