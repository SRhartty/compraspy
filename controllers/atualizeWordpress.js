const woocommerce = require('../exports/woocommerce');
//retirar em produçao
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

exports.atualizeWordpress = async (regular_price, id_produto) => {
     regular_price = regular_price.replace(',', '.');
     woocommerce.WooCommerce.put(`products/${id_produto}`, {
          regular_price: regular_price
     }, function (err, data, res) {
          if (err) {
               console.log(err);
               return;
          }
          console.log(res);
     });
}