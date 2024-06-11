const express = require('express'); 
const categoryCtr = require('../controllers/category');

const router = express.Router();
const auth = require('../middleware/auth');

router.get('/:id', categoryCtr.getCategory);

router.get('/', categoryCtr.getAllCategory);

// router.use(auth);

router.post('/', auth, categoryCtr.createCategory);

router.put('/:id', auth, categoryCtr.modifyCategory);

router.delete('/:id', auth, categoryCtr.deleteCategory);

module.exports = router;