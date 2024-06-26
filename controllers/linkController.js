const mysqlPool = require('../exports/mysqlPool');

exports.createLink = async (req, res) => {
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
    }

    const id_produto = req.body.id_produto;
    const link_compras = req.body.link;
    const preco = req.body.preco;
    const current_status = 'aguardando';

    const checkQuery = `SELECT COUNT(*) AS count FROM compraspy.compras WHERE id_produto = ?`;
    const insertQuery = `INSERT INTO compraspy.compras (id_produto, link_compras, preco, current_status) VALUES (?, ?, ?, ?)`;
    const updateQuery = `UPDATE compraspy.compras SET link_compras = ?, preco = ? WHERE id_produto = ?`;

    try {
        // Obtém uma conexão do pool
        mysqlPool.pool.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erro interno do servidor' });
                return;
            }

            // Verifica se o id_produto já existe
            connection.query(checkQuery, [id_produto], (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ message: 'Erro interno do servidor' });
                    connection.release();
                    return;
                }

                if (results[0].count > 0) {
                    // Atualiza o registro existente
                    connection.query(updateQuery, [link_compras, preco, id_produto], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Erro interno do servidor' });
                            connection.release();
                            return;
                        }

                        res.status(200).json({ message: "Registro atualizado com sucesso" });
                        console.log('Registro atualizado com sucesso');
                        connection.release();
                    });
                } else {
                    // Insere um novo registro
                    connection.query(insertQuery, [id_produto, link_compras, preco, current_status], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Erro interno do servidor' });
                            connection.release();
                            return;
                        }

                        res.status(200).json({ message: "Registro inserido com sucesso" });
                        console.log('Registro inserido com sucesso');
                        connection.release();
                    });
                }
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};


