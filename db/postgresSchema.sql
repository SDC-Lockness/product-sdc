DROP DATABASE IF EXISTS products;

CREATE DATABASE products;

\c products

DROP TABLE IF EXISTS product, style, related, feature, photo, sku;

CREATE TABLE product (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(50),
  slogan VARCHAR(300),
  description TEXT,
  category VARCHAR(50),
  default_price MONEY
);

CREATE TABLE style (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  product_id INT,
  name text,
  sale_price MONEY,
  original_price MONEY,
  default_style BOOLEAN,
  CONSTRAINT fk_product
    FOREIGN KEY(product_id)
      REFERENCES product(id)
);

CREATE TABLE related (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  product_id INT,
  related_id INT,
  CONSTRAINT fk_product
    FOREIGN KEY(product_id)
      REFERENCES product(id),
  CONSTRAINT fk_related
    FOREIGN KEY(product_id)
      REFERENCES product(id)
);

CREATE TABLE feature (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  product_id INT,
  feature VARCHAR(255),
  value VARCHAR(255),
  CONSTRAINT fk_product
    FOREIGN KEY(product_id)
      REFERENCES product(id)
);

CREATE TABLE photo (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  style_id INT,
  url text,
  thumbnail_url text,
  CONSTRAINT fk_style
    FOREIGN KEY(style_id)
      REFERENCES style(id)
);

CREATE TABLE sku (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  style_id INT,
  size VARCHAR(31),
  quantity INT,
  CONSTRAINT fk_style
    FOREIGN KEY(style_id)
      REFERENCES style(id)
);

-- populate databases with excel data

COPY product
FROM '/tmp/data/product.csv'
DELIMITER ',' CSV HEADER
NULL AS 'null';

COPY related
FROM '/tmp/data/related.csv'
DELIMITER ',' CSV HEADER
NULL AS 'null';

COPY feature
FROM '/tmp/data/features.csv'
DELIMITER ',' CSV HEADER
NULL AS 'null';

COPY style
FROM '/tmp/data/styles.csv'
DELIMITER ',' CSV HEADER
NULL AS 'null';

COPY photo
FROM '/tmp/data/photos.csv'
DELIMITER ',' CSV HEADER
NULL AS 'null';

COPY sku
FROM '/tmp/data/skus.csv'
DELIMITER ',' CSV HEADER
NULL AS 'null';

-- create indexes

CREATE INDEX fk_index_feature_product_id ON feature(product_id);
CREATE INDEX fk_index_related_product_id ON related(product_id);
CREATE INDEX fk_index_style_product_id ON style(product_id);
CREATE INDEX fk_index_photo_style_id ON photo(style_id);
CREATE INDEX fk_index_sku_product_id ON sku(style_id);