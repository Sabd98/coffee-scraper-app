import { Sequelize } from "sequelize";
import config from "./config";
import pg from "pg";

//Konfigurasi koneksi ke database
export const sequelize = new Sequelize({
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT ? Number(config.DB_PORT) : undefined,
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: false,
    sslmode: "disable",
  },
});

// Hapus dependensi fs dengan menonaktifkan fitur yang memerlukan fs
sequelize.connectionManager.initPools();
