require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
  allowExitOnIdle: false
});

const productInfo = async (req) => {
  const product = pool.query(`SELECT * FROM product WHERE id=${req.params.product_id}`);
  const features = pool.query(`SELECT feature, value FROM feature WHERE product_id=${req.params.product_id}`)
  const promises = await Promise.all([product, features]);
  return promises;
}

const productStyles = async (req) => {
  const product = {id: req.params.product_id};
  const styles = await pool.query(`SELECT * FROM style WHERE product_id=${req.params.product_id}`);
  product.results = styles.rows;
  product.results.forEach(style => {
    style.photos = [];
    style.skus = {};
  });

  const stylePhotos = Promise.all(product.results.map(async style => {
    const res = await pool.query(`SELECT thumbnail_url, url FROM photo WHERE style_id=${style.id}`);
    style.photos = res.rows;
  }));

  const styleSkus = Promise.all(product.results.map(async style => {
    const res = await pool.query(`SELECT id, size, quantity FROM sku WHERE style_id=${style.id}`);
    res.rows.forEach(sku => style.skus[sku.id] = {size: sku.size, quantity: sku.quantity});
  }));

  const promises = await Promise.all([stylePhotos, styleSkus])
  return product;
};

app.use(cors());
app.use(logger);

app.get('/products', async (req, res) => {
  try {
    if (req.query.count < 1 || req.query.page < 1) {
      res.send('query params are incorrect');
    } else {
      const {rows} = await pool.query(`SELECT * FROM product LIMIT ${req.query.count} OFFSET ${(req.query.page - 1) * req.query.count}`);
      res.send(rows);
    }
  } catch {
    console.error('something went wrong');
  }
});

app.get('/products/:product_id', async (req, res) => {
  if (req.params.product_id < 1) {
    res.send('product id is incorrect');
  } else {
    const fullProduct = await productInfo(req);
    const product = fullProduct[0].rows[0];
    const features = fullProduct[1].rows;
    product.features = features;
    res.send(product);
  }
});

app.get('/products/:product_id/styles', async (req, res) => {
  if (req.params.product_id < 1) {
    res.send('product id is incorrect');
  } else {
    const fullProduct = await productStyles(req);
    res.send(fullProduct);
  }
});

app.get('/products/:product_id/related', async (req, res) => {
  if (req.params.product_id < 1) {
    res.send('product id is incorrect');
  } else {
    const {rows} = await pool.query(`SELECT related_id FROM related WHERE product_id=${req.params.product_id}`);
    const related = [];
    rows.map(r => related.push(r.related_id));
    res.send(related);
  }
});

app.listen(3005);

function logger(req, res, next) {
  console.log(`${req.method} received from ${req.url}`);
  next();
};