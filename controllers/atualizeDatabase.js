const mysqlPool = require('../exports/mysqlPool');

exports.atualizeDatabase = async (preco_compras, id_produto) =>{

    const updateQuery = `UPDATE compraspy.compras SET preco = ? WHERE id_produto = ?`;
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Erro interno do servidor' });
            return;
        }
        console.log(preco_compras);
        connection.query(updateQuery, [ parseFloat(preco_compras), id_produto], (err, result) => {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }
            connection.release();
        });
    });
}