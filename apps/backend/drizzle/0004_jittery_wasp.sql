CREATE TABLE "user_profiles" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"username" varchar(30) NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_username_unique" UNIQUE("username")
);
