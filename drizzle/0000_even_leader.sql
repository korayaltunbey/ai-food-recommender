CREATE TABLE `ingredients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`is_pantry_staple` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ingredients_normalized_name_unique` ON `ingredients` (`normalized_name`);--> statement-breakpoint
CREATE TABLE `recipe_diets` (
	`recipe_id` integer NOT NULL,
	`diet` text NOT NULL,
	PRIMARY KEY(`recipe_id`, `diet`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recipe_diets_diet_idx` ON `recipe_diets` (`diet`);--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`recipe_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`quantity` real,
	`unit` text NOT NULL,
	`quantity_text` text,
	`preparation` text,
	`is_optional` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`recipe_id`, `ingredient_id`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "recipe_ingredients_quantity_present" CHECK("recipe_ingredients"."quantity" IS NOT NULL OR "recipe_ingredients"."quantity_text" IS NOT NULL),
	CONSTRAINT "recipe_ingredients_quantity_positive" CHECK("recipe_ingredients"."quantity" IS NULL OR "recipe_ingredients"."quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX `recipe_ingredients_ingredient_idx` ON `recipe_ingredients` (`ingredient_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_recipe_idx` ON `recipe_ingredients` (`recipe_id`);--> statement-breakpoint
CREATE TABLE `recipe_steps` (
	`recipe_id` integer NOT NULL,
	`step_order` integer NOT NULL,
	`instruction` text NOT NULL,
	PRIMARY KEY(`recipe_id`, `step_order`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "recipe_steps_order_positive" CHECK("recipe_steps"."step_order" > 0)
);
--> statement-breakpoint
CREATE INDEX `recipe_steps_recipe_idx` ON `recipe_steps` (`recipe_id`,`step_order`);--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`cuisine` text,
	`time_minutes` integer NOT NULL,
	`difficulty` text NOT NULL,
	`base_servings` integer NOT NULL,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "recipes_time_positive" CHECK("recipes"."time_minutes" > 0),
	CONSTRAINT "recipes_servings_positive" CHECK("recipes"."base_servings" > 0),
	CONSTRAINT "recipes_difficulty_valid" CHECK("recipes"."difficulty" IN ('Kolay', 'Orta', 'Zor'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipes_slug_unique` ON `recipes` (`slug`);--> statement-breakpoint
CREATE INDEX `recipes_active_category_idx` ON `recipes` (`is_active`,`category`);--> statement-breakpoint
CREATE INDEX `recipes_active_cuisine_idx` ON `recipes` (`is_active`,`cuisine`);--> statement-breakpoint
CREATE INDEX `recipes_active_time_idx` ON `recipes` (`is_active`,`time_minutes`);