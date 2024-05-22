const puppeteer = require('puppeteer');
const mysqlPool = require('../exports/mysqlPool');
const WooCommerceAPI = require('../controllers/atualizeWordpress');
const func_atualizeDatabase = require('../controllers/atualizeDatabase');

exports.cronJob = async function () {
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
            return;
        }

        const countQuery = `SELECT COUNT(*) AS count FROM compraspy.compras WHERE current_status = 'aguardando'`;
        const checkQuery = `SELECT COUNT(*) AS count FROM compraspy.compras WHERE current_status = 'processando'`;
        const query = `SELECT id_produto, link_compras, preco FROM compraspy.compras WHERE current_status = 'aguardando' ORDER BY updated_at ASC LIMIT 1`;
        const updateQuery = `UPDATE compraspy.compras SET current_status = ? WHERE id_produto = ?`;

        connection.query(checkQuery, (err, results) => {
            console.log("check1");
            if (err) {
                connection.release();
                return;
            }
            if (results[0].count > 10) {
                connection.release();
                return;
            }

            connection.query(countQuery, (err, results) => {
                console.log("check2");
                if (err) {
                    connection.release();
                    return;
                }

                if (results[0].count === 0) {
                    connection.release();
                    return;
                }

                connection.query(query, async (err, results) => {
                    console.log("check3");
                    if (err) {
                        connection.release();
                        return;
                    }
                    
                    connection.query(updateQuery, ['processando', results[0].id_produto], (err) => {
                        console.log("check4");
                        if (err) {
                            return;
                        }
                    });
    
                    let preco_compras = await screaping(results[0].link_compras);
    
                    if (parseFloat(preco_compras) !== parseFloat(results[0].preco)) {
                        WooCommerceAPI.atualizeWordpress(preco_compras, results[0].id_produto);
                        func_atualizeDatabase.atualizeDatabase(preco_compras, results[0].id_produto);
                    }
    
                    connection.query(updateQuery, ['aguardando', results[0].id_produto], (err) => {
                        console.log("check5");
                        if (err) {
                            return;
                        }
                    });
                    connection.release();
                });
            });
        });
    });
};

async function screaping(link_compras) {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(link_compras, { waitUntil: 'domcontentloaded' });

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

