var express = require('express');
var router = express.Router();
const linkController = require('../controllers/linkController');

/* GET users listing. */
router.post('/', linkController.createLink);

module.exports = router;