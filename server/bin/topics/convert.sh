# This will load them in about three minutes
(echo 'BEGIN TRANSACTION;' && pv *.nt| perl ~/dev/unscroll/server/bin/topics/n3.pl && echo 'COMMIT;';)|pv|sqlite3 test.db
