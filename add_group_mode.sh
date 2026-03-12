#!/bin/sh
mysql -uroot -pstrongpassword whaticket -e "ALTER TABLE \`Contacts\` ADD COLUMN IF NOT EXISTS \`groupMode\` TINYINT(1) NOT NULL DEFAULT 0;"
echo "Done. Exit: $?"
