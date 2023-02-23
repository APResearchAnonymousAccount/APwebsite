 #! /bin/bash
rm apdb.sql
rm apdbsqlite3.sql
rm apdb.sqlite
 mysqldump  -h 34.162.43.147 -u apwebsiteuser --password='FpH{dXA62Koe%EVV' apwebsitedb > apdb.sql
 ./mysql2sqlite.sh apdb.sql > apdbsqlite3.sql
 sqlite3 apdb.sqlite < apdbsqlite3.sql