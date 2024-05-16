const puppeteer = require('puppeteer');
const mysqlPool = require('../exports/mysqlPool');

exports.cronJob = function () {
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return;
        }

        const query = `SELECT link_compras FROM compraspy.compras ORDER BY updated_at ASC LIMIT 1`;
        const updateQuery = `UPDATE compraspy.compras SET current_status = ? WHERE id_produto = ?`;

        connection.query(query, (err, results) => {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }

            console.log(results[0].link_compras);
            connection.release();
            return results;
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
    console.log(price);
    await browser.close();
    return price;
};

