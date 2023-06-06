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

CREATE TABLE "transactions" (
	"confirmation"	INTEGER NOT NULL UNIQUE,
	"products"	TEXT NOT NULL,
	"userid"	INTEGER NOT NULL,
	PRIMARY KEY("confirmation" AUTOINCREMENT),
	FOREIGN KEY("userid") REFERENCES "users"("id")
);

CREATE TABLE "users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"email"	TEXT NOT NULL UNIQUE,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);