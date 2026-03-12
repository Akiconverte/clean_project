"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Whatsapps");
    
    if (!tableInfo.aiAgentPrompt) {
      await queryInterface.addColumn("Whatsapps", "aiAgentPrompt", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableInfo.aiAgentExtraCommands) {
      await queryInterface.addColumn("Whatsapps", "aiAgentExtraCommands", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableInfo.aiAgentTemperature) {
      await queryInterface.addColumn("Whatsapps", "aiAgentTemperature", {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.5
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "aiAgentPrompt");
    await queryInterface.removeColumn("Whatsapps", "aiAgentExtraCommands");
    await queryInterface.removeColumn("Whatsapps", "aiAgentTemperature");
  }
};
