"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Contacts");
    
    if (!tableInfo.groupMode) {
      await queryInterface.addColumn("Contacts", "groupMode", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!tableInfo.groupTag) {
      await queryInterface.addColumn("Contacts", "groupTag", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Contacts", "groupMode");
    await queryInterface.removeColumn("Contacts", "groupTag");
  }
};
