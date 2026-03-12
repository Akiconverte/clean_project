import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Whatsapps", "useAIAgent", {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }),
            queryInterface.addColumn("Whatsapps", "aiAgentPrompt", {
                type: DataTypes.TEXT,
                allowNull: true
            }),
            queryInterface.addColumn("Whatsapps", "aiAgentExtraCommands", {
                type: DataTypes.TEXT,
                allowNull: true
            }),
            queryInterface.addColumn("Whatsapps", "aiAgentTemperature", {
                type: DataTypes.FLOAT,
                defaultValue: 0.5
            })
        ]);
    },

    down: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Whatsapps", "useAIAgent"),
            queryInterface.removeColumn("Whatsapps", "aiAgentPrompt"),
            queryInterface.removeColumn("Whatsapps", "aiAgentExtraCommands"),
            queryInterface.removeColumn("Whatsapps", "aiAgentTemperature")
        ]);
    }
};
