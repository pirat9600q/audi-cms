# --- !Ups

ALTER TABLE news RENAME TO articles;

ALTER TABLE articles
    ADD COLUMN category VARCHAR(50) NOT NULL;

DROP TABLE offers;

DROP TABLE generic_texts;

# --- !Downs
