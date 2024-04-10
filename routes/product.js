const express = require('express'); 

const auth = require('../middleware/auth');
const productCtr = require('../controllers/product');

const router = express.Router();

router.get('/:id', productCtr.getProduct);

router.get('/', productCtr.getAllProducts);

router.get('/categories/:id', productCtr.getAllProductsByCategory);

router.use(auth);

router.post('/', productCtr.createProduct);

router.put('/:id', productCtr.modifyProduct);

router.delete('/:id', productCtr.deleteProduct);


module.exports = router;