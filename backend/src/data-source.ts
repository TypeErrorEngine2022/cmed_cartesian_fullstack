import { DataSource } from "typeorm";
import { Formula } from "./entity/Formula";
import { Criteria } from "./entity/Criteria";
import { Attribute } from "./entity/Attribute";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "cartesian",
  synchronize: true,
  logging: true,
  entities: [Formula, Criteria, Attribute],
  subscribers: [],
  migrations: [],
});
