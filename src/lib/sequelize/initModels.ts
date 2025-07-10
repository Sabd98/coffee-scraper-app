import { sequelize } from "./connection";
import { Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
// Definisikan model User
export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "default_password",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
// Definisikan model Product
export class Product extends Model {
  public id!: number;
  public title!: string;
  public price!: number;
  public url!: string;
  public deliveryCity!: string;
  public scrapedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deliveryCity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "delivery_city",
    },
    scrapedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "scraped_at",
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    createdAt: "scraped_at",
    updatedAt: false,
  }
);

let modelsSynced = false;

export async function syncModels() {
  if (modelsSynced) return;

  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Tambahkan migrasi untuk kolom password
    await sequelize.query(`
      DO $$ 
      BEGIN
        BEGIN
          ALTER TABLE users ADD COLUMN password VARCHAR(100) NOT NULL DEFAULT 'default_password';
        EXCEPTION
          WHEN duplicate_column THEN 
            -- Kolom sudah ada, tidak perlu dilakukan apa-apa
            RAISE NOTICE 'Column password already exists';
        END;
      END $$
    `);

    // // Update password untuk user yang sudah ada
    // await User.update(
    //   { password: "password123" }, // Set password default
    //   { where: { password: "default_password" } } // Hanya untuk user dengan password default
    // );

    // Sinkronkan model dengan aman
    await sequelize.sync({ alter: true });

    console.log("Models synchronized.");
    modelsSynced = true;
  } catch (error) {
    console.error("Database sync failed:", error);
  }
}

export { sequelize };
