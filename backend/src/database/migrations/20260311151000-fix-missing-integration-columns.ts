import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addColumn("Queues", "integrationId", {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn("Whatsapps", "integrationId", {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    } catch (e) {}
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "integrationId");
    await queryInterface.removeColumn("Queues", "integrationId");
  }
};
