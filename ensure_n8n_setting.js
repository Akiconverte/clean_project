const mysql = require('mysql2/promise');
async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'db',
            user: 'root',
            password: 'strongpassword',
            database: 'whaticket'
        });
        const [rows] = await connection.execute("SELECT * FROM Settings WHERE `key` = 'n8nUrl'");
        if (rows.length === 0) {
            await connection.execute("INSERT INTO Settings (`key`, `value`, `createdAt`, `updatedAt`) VALUES ('n8nUrl', '', NOW(), NOW())");
            console.log('n8nUrl created successfully.');
        } else {
            console.log('n8nUrl already exists.');
        }
        await connection.end();
    } catch (err) {
        console.error('Error ensuring n8nUrl:', err);
    }
}
run();
