import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("QueueIntegrations")) {
      await queryInterface.createTable("QueueIntegrations", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        projectName: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        jsonContent: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        urlN8N: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        language: {
          type: DataTypes.STRING,
          allowNull: true
        },
        companyId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        typebotSlug: {
          type: DataTypes.STRING,
          allowNull: true
        },
        typebotExpires: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        typebotKeywordFinish: {
          type: DataTypes.STRING,
          allowNull: true
        },
        typebotUnknownMessage: {
          type: DataTypes.STRING,
          allowNull: true
        },
        typebotDelayMessage: {
          type: DataTypes.INTEGER,
          defaultValue: 1000,
          allowNull: true
        },
        typebotKeywordRestart: {
          type: DataTypes.STRING,
          allowNull: true
        },
        typebotRestartMessage: {
          type: DataTypes.STRING,
          allowNull: true
        },
        createdAt: {
          type: DataTypes.DATE(6),
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE(6),
          allowNull: false
        }
      });
    }

    try {
      await queryInterface.addColumn("Queues", "integrationId", {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    } catch (err) {
      console.log("Column integrationId already exists in Queues");
    }

    try {
      await queryInterface.addColumn("Whatsapps", "integrationId", {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    } catch (err) {
      console.log("Column integrationId already exists in Whatsapps");
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "integrationId");
    await queryInterface.removeColumn("Queues", "integrationId");
    await queryInterface.dropTable("QueueIntegrations");
  }
};
