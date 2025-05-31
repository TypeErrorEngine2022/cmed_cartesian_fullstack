import { DataSource } from "typeorm";
import { Formula } from "./entity/Formula";
import { Criteria } from "./entity/Criteria";
import { Attribute } from "./entity/Attribute";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "test",
  password: process.env.DB_PASSWORD || "test",
  database: process.env.DB_DATABASE || "test",
  synchronize: true,
  logging: true,
  entities: [Formula, Criteria, Attribute],
  subscribers: [],
  migrations: [],
});
