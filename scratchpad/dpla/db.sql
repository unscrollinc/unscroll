PRAGMA main.page_size = 4096 ;
PRAGMA main.cache_size = 10000 ;
PRAGMA main.locking_mode = EXCLUSIVE ;
PRAGMA main.synchronous = NORMAL ;
PRAGMA main.journal_mode = WAL ;
CREATE TABLE IF NOT EXISTS data (json JSON);
