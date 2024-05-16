const puppeteer = require('puppeteer');

const mysqlPool = require('../exports/mysqlPool');

exports.cronJob = function () {
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return;
        }

        const query = `SELECT id_produto, link_compras FROM compraspy.compras`;
        connection.query(query, (err, results) => {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }

            console.log('Executando a tarefa agendada');
            screaping(results[0].link_compras);
            connection.release();


        });
    });
};

async function screaping(link_compras) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(link_compras);

    // Set screen size
    await page.setViewport({ width: 100, height: 100 });
    
    //pegar preço do produto
    const price = await page.evaluate(() => {
        return document.querySelector('.header-product-info--price', 'span').innerText;
    });
    console.log(price);
    await browser.close();
};

