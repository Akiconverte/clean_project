#!/bin/sh
mysql -uroot -pstrongpassword whaticket -e "INSERT IGNORE INTO \`Settings\` (\`key\`, \`value\`, \`createdAt\`, \`updatedAt\`) VALUES ('n8nUrl', '', NOW(), NOW());"
echo "Done. Exit: $?"
