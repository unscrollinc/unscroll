DB=dpla.db
rm $DB ;
cat db.sql | sqlite3 $DB ;
echo "begin transaction; " |sqlite3 $DB
pv -cN source < ~/Dropbox/all.json.gz | gzcat | sed '1d;$d' | perl -ne "s/^,//; s/'/''/g; s/(.*)$/insert into data values ('\$1');/;print;" | sqlite3 $DB ;
echo "commit; " | sqlite3 $DB


