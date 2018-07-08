DB=cache/met.db
rm ${DB}

echo 'create table data(json json);'| sqlite3 ${DB}

for a in `ls cache/met/*.json`;
do echo $a && cat $a | jq -c -r '.results[]' | sed "s/'/''/g" | perl -ne 'chomp;print "insert into data (json) values ('"'"'$_'"'"');\n"'|sqlite3 ${DB}
done;


echo "create table collection(title text, image text, url text, date text, description text, medium text);" | sqlite3 ${DB}

echo "insert into collection select json_extract(json, '$.title') as title, json_extract(json, '$.image') as image, json_extract(json, '$.url') as url, json_extract(json, '$.date') as date, json_extract(json, '$.teaserText') as description, json_extract(json, '$.medium') as medium from data;" | sqlite3 ${DB}
