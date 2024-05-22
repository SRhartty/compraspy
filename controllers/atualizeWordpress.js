const woocommerce = require('../exports/woocommerce');
//retirar em produçao
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

exports.atualizeWordpress = async (regular_price, id_produto) => {
     console.log(regular_price);
   woocommerce.WooCommerce.post(`products/${id_produto}`, {
         regular_price: regular_price
    }, function(err, data, res) {
         if (err) {
              console.log(err);
              return;
         }
    });
}