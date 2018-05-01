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
       FOREIGN KEY (from_id) references subject(id), foreign key (to_id) references subject(id));

SELECT from_id, to_id, t1.title, t2.title
FROM   broader, subject s1, subject s2, titles t1, titles t2
WHERE  t1.subject_id = s1.id AND broader.from_id = s1.id AND t1.subject_id = broader.from_id
AND    t2.subject_id = s2.id AND broader.to_id = s2.id AND t2.subject_id = broader.to_id;


http://purl.org/dc/terms/identifier
http://purl.org/dc/terms/isReplacedBy
http://purl.org/dc/terms/license
http://purl.org/dc/terms/replaces
http://purl.org/dc/terms/title
http://schema.org/geo
http://schema.org/latitude
http://schema.org/longitude
http://schema.org/name
http://schema.org/sameAs
http://www.w3.org/1999/02/22-rdf-syntax-ns#type
http://www.w3.org/2000/01/rdf-schema#comment
http://www.w3.org/2000/01/rdf-schema#label
http://www.w3.org/2000/01/rdf-schema#seeAlso
http://www.w3.org/2002/07/owl#sameAs
http://www.w3.org/2004/02/skos/core#altLabel
http://www.w3.org/2004/02/skos/core#broader
http://www.w3.org/2004/02/skos/core#inScheme
http://www.w3.org/2004/02/skos/core#prefLabel
http://www.w3.org/2004/02/skos/core#related
http://www.w3.org/2004/02/skos/core#relatedMatch
http://xmlns.com/foaf/0.1/focus
