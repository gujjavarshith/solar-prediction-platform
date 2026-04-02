// Prisma client singleton — reuses one connection pool across the app.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
