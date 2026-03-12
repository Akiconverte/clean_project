
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
            "INSERT INTO Settings (key, value, createdAt, updatedAt) SELECT 'n8nUrl', '', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM Settings WHERE key = 'n8nUrl');"
        );
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("Settings", { key: "n8nUrl" });
    }
};
