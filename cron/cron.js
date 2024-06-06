const puppeteer = require('puppeteer');
const mysqlPool = require('../exports/mysqlPool');
const WooCommerceAPI = require('../controllers/atualizeWordpress');
const func_atualizeDatabase = require('../controllers/atualizeDatabase');

exports.cronJob = async function () {
    try {
        mysqlPool.pool.getConnection((err, connection) => {
            if (err) {
                throw err;
            }
            console.log("banco conectado");
            const countQuery = `SELECT COUNT(*) AS count FROM compraspy.compras WHERE current_status = 'aguardando'`;
            const checkQuery = `SELECT COUNT(*) AS count FROM compraspy.compras WHERE current_status = 'processando'`;
            const query = `SELECT id_produto, link_compras, preco FROM compraspy.compras WHERE current_status = 'aguardando' ORDER BY updated_at ASC LIMIT 1`;
            const updateQuery = `UPDATE compraspy.compras SET current_status = ? WHERE id_produto = ?`;

            connection.query(checkQuery, (err, results) => {

                if (err) {
                    connection.release();
                    throw err;
                }
                if (results[0].count > 3) {
                    connection.release();
                   return;
                }

                connection.query(countQuery, (err, results) => {

                    if (err) {
                        connection.release();
                        throw err;
                    }

                    if (results[0].count === 0) {
                        connection.release();
                        return;
                    }

                    connection.query(query, async (err, results) => {

                        if (err) {
                            connection.release();
                            throw err;
                        }

                        connection.query(updateQuery, ['processando', results[0].id_produto], (err) => {

                            if (err) {
                                connection.release();
                                throw err;
                            }
                        });
                        console.log("inicio do screapy");
                        let preco_compras;
                        try {
                            preco_compras = await screaping(results[0].link_compras);
                        } catch (error) {
                            connection.release();
                            throw error;
                        }


                        if (parseFloat(preco_compras) !== parseFloat(results[0].preco)) {
                            console.log('Preço alterado');
                            WooCommerceAPI.atualizeWordpress(preco_compras, results[0].id_produto);
                            func_atualizeDatabase.atualizeDatabase(preco_compras, results[0].id_produto);
                        }

                        connection.query(updateQuery, ['aguardando', results[0].id_produto], (err) => {

                            if (err) {
                                throw err;
                            }
                        });
                        connection.release();
                    });
                });
            });
        });
    }
    catch (error) {
        console.error('Error during cron job:', error);
    }
};

async function screaping(link_compras) {
    const browser = await puppeteer.launch(
        {
            product: 'chrome',
            args: ['--no-sandbox']
        }
    // {
    //     executablePath: '/usr/bin/chromium-browser',
    //     args: ['--no-sandbox']
    // }
    );
    const page = await browser.newPage();
    console.log("abrindo link do compras");
    await page.goto(link_compras, { waitUntil: 'domcontentloaded' });

    //pegar preço do produto
    const price = await page.evaluate(() => {
        const priceElements = document.querySelectorAll(".header-product-info--price span");
        const firstPrice = priceElements[0].textContent.trim(); 
        const numericPrice = firstPrice.replace('US$ ', '');
        return numericPrice;
    });
    console.log("preco consultado");
    await browser.close();
    return price;
};

