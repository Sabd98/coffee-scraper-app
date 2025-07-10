import { sequelize } from "./sequelize/connection";
import { User } from "./sequelize/initModels";

export async function initDummyUser() {
  try {
    await sequelize.sync({ alter: true });

    // Cek apakah user sudah ada
    const existingUser = await User.findOne({
      where: { email: "user@example.com" },
    });

    if (!existingUser) {
      await User.create({
        name: "Dummy User",
        email: "user@example.com",
        password: "password123", 
      });
      console.log("Dummy user created");
    }
  } catch (error) {
    console.error("Failed to create dummy user:", error);
  }
}

// Panggil fungsi ini di entry point aplikasi (misal: layout.tsx)
