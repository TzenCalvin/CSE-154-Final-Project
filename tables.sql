CREATE TABLE "products" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	"shortname"	TEXT NOT NULL UNIQUE,
	"price"	REAL NOT NULL,
	"description"	TEXT NOT NULL UNIQUE,
	"pot-size"	INTEGER NOT NULL,
	"plant-height"	INTEGER,
	"color"	TEXT,
	"flowers"	BLOB,
	"manageability"	TEXT,
	"item-type"	TEXT,
	"capacity"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"email"	TEXT NOT NULL UNIQUE,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);