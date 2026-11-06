import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/index.js";
import "dotenv/config";

const config = {
  server: process.env.DATABASE_SERVER_NAME,
  port: +process.env.DATABASE_PORT,
  database: "BillOfMaterials",
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  options: {
    trustServerCertificate: true,
  },
};

const adapter = new PrismaMssql(config);
const prisma = new PrismaClient({ adapter });

export default prisma;
