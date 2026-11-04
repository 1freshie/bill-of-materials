import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma";

const config = {
  server: "localhost",
  port: 51041,
  database: "BillOfMaterials",
  options: {
    trustServerCertificate: true,
    integratedSecurity: true,
  },
};

const adapter = new PrismaMssql(config);
const prisma = new PrismaClient({ adapter });

export default prisma;
