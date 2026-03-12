import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: any = await queryInterface.describeTable("Contacts");
    
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

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Contacts", "groupMode");
    await queryInterface.removeColumn("Contacts", "groupTag");
  }
};
