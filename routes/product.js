const express = require('express'); 
const productCtr = require("../controllers/product");

const router = express.Router();

router.post('/', productCtr.createProduct);

router.put('/:id', productCtr.modifyProduct);

router.delete('/:id', productCtr.deleteProduct);

router.get('/:id', productCtr.getProduct);

router.get('/', productCtr.getAllProducts);

module.exports = router;