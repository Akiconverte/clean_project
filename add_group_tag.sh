#!/bin/sh
mysql -uroot -pstrongpassword whaticket -e "ALTER TABLE \`Contacts\` ADD COLUMN IF NOT EXISTS \`groupTag\` VARCHAR(100) NULL;"
echo "Done. Exit: $?"
