PRAGMA main.page_size = 8182;
PRAGMA main.cache_size = 20000;
PRAGMA main.locking_mode = EXCLUSIVE;
PRAGMA main.synchronous = NORMAL;
PRAGMA main.journal_mode = WAL;
.echo on
.bail on

DROP TABLE IF EXISTS uri;
CREATE TABLE uri (
       id INTEGER PRIMARY KEY NOT NULL,
       uri TEXT NOT NULL
);

DROP TABLE IF EXISTS triples;
CREATE TABLE triples (
  s TEXT NOT NULL,
  p TEXT NOT NULL,
  o TEXT DEFAULT NULL,
  olit TEXT DEFAULT NULL
);

CREATE TABLE subject (
       id INTEGER PRIMARY KEY,
       uri TEXT NOT NULL
);

; INSERT INTO subject (uri) select distinct(s) as uri from triples;
; CREATE index subject_idx on subject(uri);
;

SELECT subject.id as subject_id, olit as title FROM triples, subject WHERE (p='http://schema.org/name' OR p='http://www.w3.org/2000/01/rdf-schema#label' OR p='http://www.w3.org/2004/02/skos/core#prefLabel') AND triples.s = subject.uri;

CREATE TABLE titles (
       id INTEGER PRIMARY KEY,
       subject_id INTEGER,       
       title TEXT NOT NULL,
       foreign key (subject_id) REFERENCES subject(id)
);

;; Make a big table of TITLES
INSERT INTO TITLES (subject_id, title) SELECT subject.id as subject_id, olit as title FROM triples, subject WHERE (p='http://schema.org/name' OR p='http://www.w3.org/2000/01/rdf-schema#label' OR p='http://www.w3.org/2004/02/skos/core#prefLabel') AND triples.s = subject.uri;

CREATE TABLE broader (
       from_id integer,
       to_id integer,
       FOREIGN KEY (from_id) references subject(id),
       FOREIGN KEY (to_id) references subject(id));

sqlite> create index titles_subject_id_idx on titles(subject_id);
sqlite> create index broader_from_id_idx on broader(from_id);
sqlite> create index broader_to_id_idx on broader(to_id);

INSERT INTO (from_id, to_id)

SELECT s, p JOIN WHERE p='http://www.w3.org/2004/02/skos/core#broader';

insert into broader (from_id, to_id) SELECT s1.id, s2.id from triples, subject s1, subject s2 WHERE p='http://www.w3.org/2004/02/skos/core#broader' AND s1.uri = triples.s AND s2.uri = triples.o;

SELECT s1.id, s2.id from triples, subjects s1, subjects s2 WHERE p='http://www.w3.org/2004/02/skos/core#broader' AND s1.uri = triples.s AND s2.uri = triples.o;

; GET ALL BROADER
SELECT from_id, to_id, t1.title, t2.title
FROM   broader, subject s1, subject s2, titles t1, titles t2
WHERE  t1.subject_id = s1.id AND broader.from_id = s1.id AND t1.subject_id = broader.from_id
AND    t2.subject_id = s2.id AND broader.to_id = s2.id AND t2.subject_id = broader.to_id;

; GET ALL SAMEAS
SELECT from_id, to_id, t1.title, t2.title
FROM   sameas, subject s1, subject s2, titles t1, titles t2
WHERE  t1.subject_id = s1.id AND sameas.from_id = s1.id AND t1.subject_id = sameas.from_id
AND    t2.subject_id = s2.id AND sameas.to_id = s2.id AND t2.subject_id = sameas.to_id;

BEGIN TRANSACTION;

DROP TABLE IF EXISTS sameas;
CREATE TABLE sameas (
       from_id INTEGER,
       to_id INTEGER,
       FOREIGN KEY (from_id) references subject(id),
       FOREIGN KEY (to_id) references subject(id)
);

CREATE INDEX sameas_from_id_idx on sameas(from_id);
CREATE INDEX sameas_to_id_idx on sameas(to_id);

INSERT INTO sameas
SELECT s1.id, s2.id from triples, subject s1, subject s2
WHERE p='http://schema.org/sameAs'
AND s1.uri = triples.s AND s2.uri = triples.o;

COMMIT;

# Literals
http://purl.org/dc/terms/identifier
http://purl.org/dc/terms/title
http://schema.org/latitude
http://schema.org/longitude
http://schema.org/name
http://www.w3.org/2000/01/rdf-schema#comment
http://www.w3.org/2000/01/rdf-schema#label
http://www.w3.org/2004/02/skos/core#altLabel
http://www.w3.org/2004/02/skos/core#prefLabel

# URIs
http://purl.org/dc/terms/isReplacedBy
http://purl.org/dc/terms/license
http://purl.org/dc/terms/replaces
http://schema.org/geo
http://schema.org/sameAs
http://www.w3.org/1999/02/22-rdf-syntax-ns#type
http://www.w3.org/2000/01/rdf-schema#seeAlso
http://www.w3.org/2002/07/owl#sameAs
http://www.w3.org/2004/02/skos/core#broader
http://www.w3.org/2004/02/skos/core#inScheme
http://www.w3.org/2004/02/skos/core#related
http://www.w3.org/2004/02/skos/core#relatedMatch
http://xmlns.com/foaf/0.1/focus
