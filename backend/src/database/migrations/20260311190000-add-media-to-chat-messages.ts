import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ChatMessages", "mediaUrl", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    }).then(() =>
      queryInterface.addColumn("ChatMessages", "mediaType", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ChatMessages", "mediaUrl")
      .then(() => queryInterface.removeColumn("ChatMessages", "mediaType"));
  }
};
