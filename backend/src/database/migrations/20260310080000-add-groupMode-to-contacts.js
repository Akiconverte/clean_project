"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn("Contacts", "groupMode", {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Contacts", "groupMode");
    }
};
