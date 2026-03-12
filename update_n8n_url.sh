#!/bin/sh
mysql -uroot -pstrongpassword whaticket -e "UPDATE \`Settings\` SET \`value\`='http://localhost:5679' WHERE \`key\`='n8nUrl';"
echo "Done. Exit: $?"
