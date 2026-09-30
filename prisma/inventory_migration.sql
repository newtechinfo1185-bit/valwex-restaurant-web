CREATE TABLE IF NOT EXISTS "stock_ingredients" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "stockQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lowStockThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "averageUnitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "stock_ingredients_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "stock_ingredients_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "stock_ingredients_restaurantId_name_key"
  ON "stock_ingredients" ("restaurantId", "name");
CREATE INDEX IF NOT EXISTS "stock_ingredients_restaurantId_isActive_idx"
  ON "stock_ingredients" ("restaurantId", "isActive");

CREATE TABLE IF NOT EXISTS "menu_recipes" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "menuItemId" TEXT,
  "menuItemName" TEXT NOT NULL,
  "menuItemKey" TEXT NOT NULL,
  "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "preparationNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "menu_recipes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "menu_recipes_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "menu_recipes_menuItemId_fkey"
    FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "menu_recipes_restaurantId_menuItemKey_key"
  ON "menu_recipes" ("restaurantId", "menuItemKey");
CREATE INDEX IF NOT EXISTS "menu_recipes_restaurantId_menuItemName_idx"
  ON "menu_recipes" ("restaurantId", "menuItemName");

CREATE TABLE IF NOT EXISTS "recipe_ingredients" (
  "id" TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  "ingredientId" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recipe_ingredients_recipeId_fkey"
    FOREIGN KEY ("recipeId") REFERENCES "menu_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "recipe_ingredients_ingredientId_fkey"
    FOREIGN KEY ("ingredientId") REFERENCES "stock_ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "recipe_ingredients_recipeId_ingredientId_key"
  ON "recipe_ingredients" ("recipeId", "ingredientId");

CREATE TABLE IF NOT EXISTS "inventory_movements" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "ingredientId" TEXT NOT NULL,
  "movementType" TEXT NOT NULL,
  "quantityDelta" DOUBLE PRECISION NOT NULL,
  "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "referenceId" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventory_movements_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_movements_ingredientId_fkey"
    FOREIGN KEY ("ingredientId") REFERENCES "stock_ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_movements_restaurantId_ingredientId_referenceId_key"
  ON "inventory_movements" ("restaurantId", "ingredientId", "referenceId");
CREATE INDEX IF NOT EXISTS "inventory_movements_restaurantId_createdAt_idx"
  ON "inventory_movements" ("restaurantId", "createdAt");
