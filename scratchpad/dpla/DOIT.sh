DB=dpla.db
FILE=~/Downloads/all.json.gz
rm $DB ;
cat db.sql | sqlite3 $DB ;
echo "BEGIN TRANSACTION; " |sqlite3 $DB
pv -cN source < $FILE | zcat | sed '1d;$d' | perl -ne "s/^,//; s/'/''/g; s/(.*)$/INSERT INTO data VALUES ('\$1');/; print;" | sqlite3 $DB ;
echo "COMMIT; " | sqlite3 $DB


