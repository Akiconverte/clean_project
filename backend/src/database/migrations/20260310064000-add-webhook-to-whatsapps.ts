import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "Whatsapps",
          "webhookUrl",
          {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "Whatsapps",
          "webhookToken",
          {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "Whatsapps",
          "token",
          {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ""
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("Whatsapps", "webhookUrl", { transaction: t }),
        queryInterface.removeColumn("Whatsapps", "webhookToken", { transaction: t }),
        queryInterface.removeColumn("Whatsapps", "token", { transaction: t })
      ]);
    });
  }
};
