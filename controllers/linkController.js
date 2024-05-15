require('dotenv').config();
const Connection = require('../database/dbConnect');


exports.createLink = async (req, res) => {
    // if (req.headers.authorization !== process.env.API_KEY) {
    //     res.status(401).json({message: 'Unauthorized'});
    //     console.log('Unauthorized');
    //     return;
    // }

    const sql = `SELECT id_produto FROM compraspy.compras WHERE id_produto = ${req.body.id_produto}`;
    if(Connection.connection.query(sql) === req.body.id_produto){
        var query = `UPDATE compraspy.compras SET link_compras = '${req.body.link}', preco = '${req.body.price}' WHERE id_produto = ${req.body.id_produto}`;
    } else {
        var query = `INSERT INTO compraspy.compras (id_produto, link_compras, preco) VALUES ('${req.body.id_produto}', '${req.body.link}', '${req.body.price}')`;
    }
    console.log(query);

    try {
        Connection.connection.query(query);
        console.log('Link created');
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
        return;
    }
    res.status(200).json({message:"ok"});
    Connection.connection.end();
}

