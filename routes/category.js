const express = require('express'); 
const categoryCtr = require('../controllers/category');

const router = express.Router();
const auth = require('../middleware/auth');

router.get('/:id', categoryCtr.getCategory);

router.get('/', categoryCtr.getAllCategory);

router.use(auth);

router.post('/', categoryCtr.createCategory);

router.put('/:id', categoryCtr.modifyCategory);

router.delete('/:id', categoryCtr.deleteCategory);

module.exports = router;