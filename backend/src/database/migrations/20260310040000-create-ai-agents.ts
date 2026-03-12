import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("AiAgents", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            prompt: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            extraCommands: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            temperature: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0.5
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("AiAgents");
    }
};
