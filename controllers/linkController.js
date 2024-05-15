require('dotenv').config();
const Connection = require('../database/dbConnect');


exports.createLink = async (req, res) => {
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({message: 'Unauthorized'});
        console.log('Unauthorized');
        return;
    }

    const query = `INSERT INTO compraspy.compras (id_produto, link_compras) VALUES ('${req.body.id}', '${req.body.link}')`;

    try {
        await Connection.connection.query(query);
        console.log('Link created');
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
        return;
    }
    res.status(200);
}

