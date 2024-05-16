const puppeteer = require('puppeteer');
const mysqlPool = require('../exports/mysqlPool');
const WooCommerceAPI = require('../controllers/atualizeWordpress');

exports.cronJob = async function () {
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return;
        }

        const query = `SELECT id_produto, link_compras, preco FROM compraspy.compras WHERE current_status = 'aguardando' ORDER BY updated_at ASC LIMIT 1`;
        const updateQuery = `UPDATE compraspy.compras SET current_status = ? WHERE id_produto = ?`;

        connection.query(query, async (err, results) => {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }

            connection.query(updateQuery, ['processando', results[0].id_produto], (err) => { 
                if (err) {
                    console.log(err);
                    return;
                }
            });

            let preco_compras = await screaping(results[0].link_compras);

            if(parseFloat(preco_compras) !== parseFloat(results[0].preco)) {
                WooCommerceAPI.atualizeWordpress(preco_compras, results[0].id_produto);
                console.log('Preço atualizado com sucesso produto id: ' + results[0].id_produto);
            }else{
                console.log('Preço não foi atualizado produto id: ' + results[0].id_produto);
            }
            
            connection.query(updateQuery, ['aguardando', results[0].id_produto], (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            connection.release();
            return;
        });
    });
};

async function screaping(link_compras) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(link_compras, { waitUntil: 'domcontentloaded'});

    //pegar preço do produto
    const price = await page.evaluate(() => {
        const priceElements = document.querySelectorAll(".header-product-info--price span");
        const firstPrice = priceElements[0].textContent.trim();
        const numericPrice = firstPrice.replace('US$ ', '');
        return numericPrice;
    });
    await browser.close();
    return price;
};

