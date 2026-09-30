import { PrismaClient, Role, TableStatus, FoodType, LicenseDuration, LicenseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding VALWEX demo data...");

  // Clean existing (dev only)
  await prisma.licenseEvent.deleteMany();
  await prisma.license.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.restaurant.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);

  const restaurant = await prisma.restaurant.create({
    data: {
      slug: "demo-cafe",
      name: "VALWEX Demo Cafe",
      address: "123 MG Road, Ahmedabad",
      phone: "9429196528",
      gstNumber: "24AAAAA0000A1Z5",
      upiId: "9157744234@ybl",
      currency: "INR",
      taxRateCGST: 2.5,
      taxRateSGST: 2.5,
      serviceCharge: 0,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@demo.com",
      passwordHash,
      name: "Demo Admin",
      role: Role.ADMIN,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "waiter@demo.com",
      passwordHash: await bcrypt.hash("waiter123", 10),
      name: "Demo Waiter",
      role: Role.WAITER,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });

  // Tables
  for (let i = 1; i <= 16; i++) {
    await prisma.table.create({
      data: {
        number: i,
        name: `T${i}`,
        capacity: i <= 8 ? 4 : 6,
        status: i === 3 ? TableStatus.OCCUPIED : i === 5 ? TableStatus.ORDER_PENDING : TableStatus.AVAILABLE,
        restaurantId: restaurant.id,
        qrCodeData: `https://localhost:3000/r/demo-cafe/table/${i}`,
      },
    });
  }

  // Categories
  const catStarters = await prisma.category.create({
    data: { name: "Starters", sortOrder: 1, restaurantId: restaurant.id },
  });
  const catMain = await prisma.category.create({
    data: { name: "Main Course", sortOrder: 2, restaurantId: restaurant.id },
  });
  const catBeverages = await prisma.category.create({
    data: { name: "Beverages", sortOrder: 3, restaurantId: restaurant.id },
  });
  const catDesserts = await prisma.category.create({
    data: { name: "Desserts", sortOrder: 4, restaurantId: restaurant.id },
  });

  // Menu items
  const items = [
    { name: "Paneer Tikka", price: 220, foodType: FoodType.VEG, categoryId: catStarters.id },
    { name: "Chicken 65", price: 260, foodType: FoodType.NON_VEG, categoryId: catStarters.id },
    { name: "Veg Spring Roll", price: 180, foodType: FoodType.VEG, categoryId: catStarters.id },
    { name: "Butter Chicken", price: 320, foodType: FoodType.NON_VEG, categoryId: catMain.id },
    { name: "Paneer Butter Masala", price: 280, foodType: FoodType.VEG, categoryId: catMain.id },
    { name: "Dal Makhani", price: 210, foodType: FoodType.VEG, categoryId: catMain.id },
    { name: "Veg Biryani", price: 250, foodType: FoodType.VEG, categoryId: catMain.id },
    { name: "Chicken Biryani", price: 290, foodType: FoodType.NON_VEG, categoryId: catMain.id },
    { name: "Masala Dosa", price: 140, foodType: FoodType.VEG, categoryId: catMain.id },
    { name: "Fresh Lime Soda", price: 60, foodType: FoodType.VEG, categoryId: catBeverages.id },
    { name: "Mango Lassi", price: 90, foodType: FoodType.VEG, categoryId: catBeverages.id },
    { name: "Cold Coffee", price: 120, foodType: FoodType.VEG, categoryId: catBeverages.id },
    { name: "Gulab Jamun", price: 80, foodType: FoodType.VEG, categoryId: catDesserts.id },
    { name: "Ice Cream Scoop", price: 70, foodType: FoodType.VEG, categoryId: catDesserts.id },
  ];

  for (const item of items) {
    await prisma.menuItem.create({
      data: {
        ...item,
        restaurantId: restaurant.id,
        isAvailable: true,
        isHidden: false,
      },
    });
  }

  // Wallet
  await prisma.wallet.create({
    data: {
      restaurantId: restaurant.id,
      balance: 500,
    },
  });

  // Active license for demo
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 30);

  await prisma.license.create({
    data: {
      key: "VALWEX-DEMO1-DEMO2-DEMO3-DEMO4",
      restaurantId: restaurant.id,
      duration: LicenseDuration.DAYS_30,
      status: LicenseStatus.ACTIVE,
      startsAt: now,
      expiresAt: expires,
      billLimit: 1000,
      billsUsed: 12,
      activatedAt: now,
      deviceLabel: "Demo Device",
    },
  });

  console.log("Seed complete.");
  console.log("Login: admin@demo.com / admin123");
  console.log("Restaurant slug: demo-cafe");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
