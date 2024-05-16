var WooCommerceAPI = require('woocommerce-api');
require('dotenv').config();
 
exports.WooCommerce = new WooCommerceAPI({
  url: process.env.WP_URL,
  consumerKey: process.env.WP_CK,
  consumerSecret: process.env.WP_CS,
  wpAPI: true,
  version: 'wc/v3'
});