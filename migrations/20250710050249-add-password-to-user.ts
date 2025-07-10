// src/lib/sequelize/migrations/add-password-to-user.ts
import { QueryInterface, } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN password VARCHAR(100) NOT NULL DEFAULT 'default_password';
    `);

    await queryInterface.sequelize.query(`
      UPDATE users 
      SET password = 'password123'
      WHERE password = 'default_password';
    `);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn("users", "password");
  },
};
