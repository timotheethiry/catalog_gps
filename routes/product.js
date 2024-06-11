const express = require('express'); 

const auth = require('../middleware/auth');
const productCtr = require('../controllers/product');

const router = express.Router();

router.get('/:id', productCtr.getProduct);

router.get('/', productCtr.getAllProducts);

router.get('/categories/:id', productCtr.getAllProductsByCategory);

// router.use(auth);

router.post('/', auth, productCtr.createProduct);

router.put('/:id', auth, productCtr.modifyProduct);

router.delete('/:id', auth, productCtr.deleteProduct);


module.exports = router;